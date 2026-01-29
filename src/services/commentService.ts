import apiClient from './apiClient';

export interface IComment {
  _id: string;
  post: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  likes: string[];
  likesCount: number;
  replies: IComment[];
  parentComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICommentsResponse {
  comments: IComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IRepliesResponse {
  replies: IComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Create a new comment
export const createComment = async (
  postId: string,
  content: string,
  parentCommentId?: string
): Promise<{ message: string; comment: IComment }> => {
  const response = await apiClient.post(`/api/comments/post/${postId}`, {
    content,
    parentCommentId,
  });
  return response.data;
};

// Get comments for a post
export const getCommentsByPost = async (
  postId: string,
  page: number = 1,
  limit: number = 10
): Promise<ICommentsResponse> => {
  const response = await apiClient.get(
    `/api/comments/post/${postId}?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Get replies for a comment
export const getReplies = async (
  commentId: string,
  page: number = 1,
  limit: number = 10
): Promise<IRepliesResponse> => {
  const response = await apiClient.get(
    `/api/comments/${commentId}/replies?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Update a comment
export const updateComment = async (
  commentId: string,
  content: string
): Promise<{ message: string; comment: IComment }> => {
  const response = await apiClient.put(`/api/comments/${commentId}`, { content });
  return response.data;
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/api/comments/${commentId}`);
  return response.data;
};

// Like/Unlike a comment
export const likeComment = async (
  commentId: string
): Promise<{ message: string; liked: boolean; likesCount: number }> => {
  const response = await apiClient.post(`/api/comments/${commentId}/like`);
  return response.data;
};
