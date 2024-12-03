## GitHub Copilot Chat

- Extension Version: 0.22.4 (prod)
- VS Code: vscode/1.95.3
- OS: Mac

## Network

User Settings:

```json
  "github.copilot.advanced": {
    "debug.useElectronFetcher": true,
    "debug.useNodeFetcher": false
  }
```

Connecting to https://api.github.com:

- DNS ipv4 Lookup: 140.82.116.5 (27 ms)
- DNS ipv6 Lookup: ::ffff:140.82.116.5 (1 ms)
- Electron Fetcher (configured): HTTP 200 (207 ms)
- Node Fetcher: HTTP 200 (129 ms)
- Helix Fetcher: HTTP 200 (160 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:

- DNS ipv4 Lookup: 140.82.114.22 (27 ms)
- DNS ipv6 Lookup: ::ffff:140.82.114.22 (1 ms)
- Electron Fetcher (configured): HTTP 200 (292 ms)
- Node Fetcher: HTTP 200 (300 ms)
- Helix Fetcher: HTTP 200 (298 ms)

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).
