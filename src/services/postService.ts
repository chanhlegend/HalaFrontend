import apiClient from './apiClient';

export interface IPost {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  images: string[];
  likes: string[];
  likesCount: number;
  commentsCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPostsResponse {
  posts: IPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ICreatePostData {
  content: string;
  images?: File[];
}

// Create a new post
export const createPost = async (data: ICreatePostData): Promise<{ message: string; post: IPost }> => {
  const formData = new FormData();
  formData.append('content', data.content);

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const response = await apiClient.post('/api/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get all posts with pagination
export const getPosts = async (page: number = 1, limit: number = 10): Promise<IPostsResponse> => {
  const response = await apiClient.get(`/api/posts?page=${page}&limit=${limit}`);
  return response.data;
};

// Get a single post by ID
export const getPostById = async (id: string): Promise<IPost> => {
  const response = await apiClient.get(`/api/posts/${id}`);
  return response.data;
};

// Get posts by user ID
export const getPostsByUser = async (userId: string, page: number = 1, limit: number = 10): Promise<IPostsResponse> => {
  const response = await apiClient.get(`/api/posts/user/${userId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Update a post
export const updatePost = async (id: string, content: string): Promise<{ message: string; post: IPost }> => {
  const response = await apiClient.put(`/api/posts/${id}`, { content });
  return response.data;
};

// Delete a post
export const deletePost = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/api/posts/${id}`);
  return response.data;
};

// Like/Unlike a post
export const likePost = async (id: string): Promise<{ message: string; liked: boolean; likesCount: number }> => {
  const response = await apiClient.post(`/api/posts/${id}/like`);
  return response.data;
};
