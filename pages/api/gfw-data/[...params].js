import httpProxyMiddleware from 'next-http-proxy-middleware';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export default (req, res) => {
  httpProxyMiddleware(req, res, {
    target: process.env.GFW_API,
    pathRewrite: [
      {
        patternStr: `^/?gfw-data-api`,
        replaceStr: '/',
      },
    ],
    headers: {
      'x-api-key': process.env.GFW_API_KEY,
    },
    followRedirects: true,
  }).catch(async (error) => {
    res.end(error.message);
  });
}
