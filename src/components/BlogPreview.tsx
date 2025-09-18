import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, ChevronRight } from 'lucide-react';

const BlogPreview = () => {
  // Sample blog posts for SEO - these will be dynamic in future
  const blogPosts = [
    {
      id: 1,
      title: 'Complete Car Service Checklist - What to Expect in 2024',
      excerpt: 'Learn about essential car maintenance tasks, pricing, and how to choose the right service center for your vehicle needs.',
      category: 'Car Maintenance',
      readTime: '5 min read',
      author: 'Revonn Team',
      publishDate: '2024-01-15',
      slug: 'complete-car-service-checklist-2024',
      image: '/placeholder.svg'
    },
    {
      id: 2,
      title: 'Bike Servicing Guide - Keep Your Two-Wheeler Running Smooth',
      excerpt: 'Essential bike maintenance tips, service intervals, and cost-effective ways to maintain your motorcycle or scooter.',
      category: 'Bike Service',
      readTime: '4 min read',
      author: 'Revonn Team',
      publishDate: '2024-01-10',
      slug: 'bike-servicing-guide-maintenance-tips',
      image: '/placeholder.svg'
    },
    {
      id: 3,
      title: 'Doorstep Vehicle Service - Convenience Meets Quality',
      excerpt: 'Discover the benefits of doorstep vehicle service and how professional mechanics can service your car at home.',
      category: 'Service Tips',
      readTime: '3 min read',
      author: 'Revonn Team',
      publishDate: '2024-01-05',
      slug: 'doorstep-vehicle-service-benefits',
      image: '/placeholder.svg'
    }
  ];

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Vehicle Care Tips & Guides
        </h2>
        <p className="text-muted-foreground">
          Expert advice on car maintenance, bike servicing, and vehicle care
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <article key={post.id}>
            <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                <img 
                  src={post.image} 
                  alt={`${post.title} - Vehicle maintenance and service guide`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center space-x-2 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link to={`/blog/${post.slug}`} className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
                    <span>Read More</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </article>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button variant="outline" asChild>
          <Link to="/blog">
            View All Articles <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* SEO Keywords for Blog */}
      <div className="text-center text-xs text-muted-foreground mt-4 opacity-75">
        <p>
          Topics: Car maintenance tips, bike servicing guide, vehicle care, auto repair advice, 
          doorstep service benefits, motorcycle maintenance, car service checklist, 
          professional vehicle care across India
        </p>
      </div>
    </section>
  );
};

export default BlogPreview;