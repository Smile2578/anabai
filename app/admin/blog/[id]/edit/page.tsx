import { use } from 'react';
import EditBlogPostClient from './EditBlogPostClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditBlogPostPage({ params }: Props) {
  const resolvedParams = use(params);
  return <EditBlogPostClient id={resolvedParams.id} />;
} 