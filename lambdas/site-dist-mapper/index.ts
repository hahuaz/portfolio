import * as AWS from "aws-sdk";
import { CloudFrontRequestHandler } from "aws-lambda";

AWS.config.update({ region: "us-east-1" });

export const postMapper: CloudFrontRequestHandler = (
  event,
      _context,
  callback
) => {
  // console.log('event', JSON.stringify(event, null, 2));

  const { request } = event.Records[0].cf;

  if (!request.uri.includes(".")) {
    // Add ".html" to the end of the URI
    request.uri += ".html";
  }

  // console.log('modified request', JSON.stringify(request, null, 2));

  return callback(null, request);
};
