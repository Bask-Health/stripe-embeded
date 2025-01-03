export default async function handler(req: any, res: any) {
    res.writeHead(302, {
        Location: 'https://app.bask.health/sso/stripe-connect'
    });
    res.end();
}