# How static website is served using AWS S3, CloudFront, and Lambda@Edge.

## Architecture Overview

The website is served through the following components:

1. **S3 Bucket**: Stores the static website files
2. **CloudFront Distribution**: CDN that serves the content globally
3. **Lambda@Edge Function**: Handles URL mapping for blog posts

## Request Flow

When a user requests a page:

- For the homepage (`/`): S3 serves `index.html` directly
- For blog posts (`/posts/*`): Lambda@Edge function modifies the request to append `.html` extension
- For 404 errors: CloudFront returns `index.html` with 200 status code

## Key Components

### S3 Bucket Configuration

- Configured for static website hosting
- `index.html` set as the default document
- Public read access enabled

### CloudFront Distribution

- Origin: S3 bucket
- Default behavior: Direct S3 access
- Additional behavior for `/posts/*`: Lambda@Edge is called for origin request (before it hits the bucket) to append `.html` extension so file can be found in the bucket.
- Error responses: if the file is not found in s3, CloudFront returns `index.html` with 200 status code.

### Lambda@Edge Function

- Triggered on origin request for `/posts/*` paths
- Appends `.html` extension to requests without file extensions
- Enables clean URLs for blog posts without showing `.html` extension
