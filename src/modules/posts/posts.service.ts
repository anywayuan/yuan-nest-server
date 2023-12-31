import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsEntity } from './entities/posts.entity';

export interface PostsRo {
  list: PostsEntity[];
  count: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) {}

  // 创建文章
  async create(post: Partial<PostsEntity>): Promise<PostsEntity> {
    const { title } = post;
    const doc = await this.postsRepository.findOne({ where: { title } });
    if (doc) {
      throw new HttpException('文章已存在', HttpStatus.CONFLICT);
    }
    return await this.postsRepository.save(post);
  }

  // 获取文章列表
  async findAll(query): Promise<PostsRo> {
    const qb = this.postsRepository.createQueryBuilder('post');
    qb.where('1 = 1');
    qb.orderBy('post.create_time', 'DESC');

    const count = await qb.getCount();
    const { pageNum = 1, pageSize = 10 } = query;
    qb.limit(pageSize);
    qb.offset(pageSize * (pageNum - 1));

    const posts = await qb.getMany();
    return { list: posts, count: count };
  }

  // 获取指定文章
  async findById(id): Promise<PostsEntity> {
    const res = await this.postsRepository.findOne({ where: { id } });
    if (isNaN(Number(id))) {
      throw new HttpException(`id 参数不合法`, HttpStatus.BAD_REQUEST);
    }
    if (!res) {
      throw new HttpException(`id为${id}的文章不存在`, HttpStatus.NOT_FOUND);
    }
    return res;
  }

  // 更新文章
  async updateById(id, post): Promise<PostsEntity> {
    const existPost = await this.findById(id);
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, HttpStatus.NOT_FOUND);
    }
    const updatePost = this.postsRepository.merge(existPost, post);
    return this.postsRepository.save(updatePost);
  }

  // 刪除文章
  async remove(id) {
    const existPost = await this.findById(id);
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, HttpStatus.NOT_FOUND);
    }
    return await this.postsRepository.remove(existPost);
  }
}
