export default async function handler(req: any, res: any) {
    res.writeHead(302, {
        Location: process.env.AUTH_URL
    });
    res.end();
}