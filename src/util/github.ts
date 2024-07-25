export async function getLatestRelease(owner: string, repo: string): Promise<any> {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`
    return fetch(url)
        .then(res => res.json() as Promise<any>)
}
