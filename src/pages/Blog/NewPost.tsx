import React from 'react';
import { Helmet } from 'react-helmet-async';
import BlogEditor from '../../components/blog/BlogEditor';

const NewPost: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>New Blog Post | PaySurity</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogEditor />
      </div>
    </>
  );
};

export default NewPost;