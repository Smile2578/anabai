// app/blog/page.tsx

import { Metadata } from 'next';
import { Suspense } from 'react';
import { HeroPost } from '@/components/blog/HeroPost';
import { CategoryFilterWrapper } from '@/components/blog/CategoryFilterWrapper';
import { Timeline } from '@/components/blog/Timeline';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { ScrollToTopWrapper } from '@/components/blog/ScrollToTopWrapper';
import connectDB from '@/lib/db/connection';
import BlogPost from '@/models/blog.model';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Blog - Anaba',
  description: 'Découvrez nos articles sur le Japon, sa culture et ses lieux incontournables.',
  openGraph: {
    title: 'Blog - Anaba',
    description: 'Découvrez nos articles sur le Japon, sa culture et ses lieux incontournables.',
  },
};

interface TimelinePost {
  _id: string;
  title: { fr: string };
  slug: string;
  publishedAt?: Date;
  createdAt: Date;
}

interface TimelineGroup {
  month: Date;
  posts: TimelinePost[];
}

async function getInitialData() {
  'use server';
  
  await connectDB();
  
  const [featuredPost, recentPosts, timelinePosts] = await Promise.all([
    BlogPost.findOne({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(1)
      .lean(),
    BlogPost.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .skip(1)
      .limit(6)
      .lean(),
    BlogPost.find(
      { status: 'published' },
      { title: 1, slug: 1, publishedAt: 1 }
    )
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean()
  ]);

  const tags = await BlogPost.distinct('tags', { status: 'published' });

  const serializedData = {
    featuredPost: JSON.parse(JSON.stringify(featuredPost)),
    recentPosts: JSON.parse(JSON.stringify(recentPosts)),
    timelinePosts: JSON.parse(JSON.stringify(timelinePosts)),
    tags
  };

  const timelineGroups = serializedData.timelinePosts.reduce((groups: TimelineGroup[], post: TimelinePost) => {
    const date = new Date(post.publishedAt || post.createdAt);
    const monthKey = new Date(date.getFullYear(), date.getMonth());
    
    const existingGroup = groups.find(g => 
      g.month.getTime() === monthKey.getTime()
    );

    if (existingGroup) {
      existingGroup.posts.push(post);
    } else {
      groups.push({
        month: monthKey,
        posts: [post]
      });
    }

    return groups;
  }, []);

  return {
    ...serializedData,
    timelineGroups
  };
}

export default async function BlogPage() {
  const { featuredPost, timelineGroups, tags } = await getInitialData();

  return (
    <div className="min-h-screen w-full mt-12">
      {/* Hero Section */}
      <section className="relative min-h-[30vh] flex items-center p-2">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/sakura2.jpg"
            alt="Fleurs de cerisier au Japon"
            fill
            className="object-cover brightness-[0.85]"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                Anablog
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Découvrez nos articles sur le Japon, sa culture et ses lieux
                <span className="block text-primary">incontournables.</span>
              </h1>
            </div>
            <div>
              <Suspense fallback={<div className="h-[60vh] min-h-[500px] bg-muted animate-pulse rounded-xl" />}>
                <HeroPost post={featuredPost} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="top-16 bg-background/80 backdrop-blur-sm z-10 py-4 border-y w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
          <CategoryFilterWrapper />
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full py-12 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Articles Grid */}
            <div className="lg:col-span-9">
              <div className="space-y-8">
                <BlogSearch initialTags={tags} />
              </div>
            </div>

            {/* Sidebar - Timeline */}
            <aside className="lg:col-span-3">
              <div className="sticky top-36">
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="font-semibold mb-4">Archives</h3>
                  <Timeline groups={timelineGroups} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <ScrollToTopWrapper />
    </div>
  );
}  