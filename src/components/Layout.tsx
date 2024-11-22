'use client';
import SideBar from '@/components/SideBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CookiesProvider } from 'react-cookie';
import { ConnectionProvider, useWallet} from '@solana/wallet-adapter-react';
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { VERIFY_MESSAGE } from '@/common/constants';
import { redirect, usePathname } from 'next/navigation';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import React from 'react';
import { UserStateProvider } from '@/providers/userStateProvider';
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";
import { TipLinkWalletAutoConnectV2  } from "@tiplink/wallet-adapter-react-ui";
import dynamic from 'next/dynamic';

const DynamicBackground = dynamic(
    async () => (await import('@/components/Background')),
    { ssr: false }
);

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');
export const WalletModalContext = createContext<{
    setIsWalletModalOpen: (isOpen: boolean) => void;
}>({
    setIsWalletModalOpen: () => {}
});

const Wrapped = ({
    children,
    onOpenTiplink,
  }: {
    children: React.ReactNode;
    onOpenTiplink: () => void;
  }) => {
    const wallet = useWallet();
    const [isHeaderHidden, setIsHeaderHidden] = useState(false);
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const pathname = usePathname();

    const address = useMemo(() => {
        return wallet.publicKey?.toBase58() ?? "";
    }, [wallet]);

    const onSidebarToggle = useCallback(() => {
        setIsSidebarActive(!isSidebarActive);
    }, [ isSidebarActive ]);

    const closeSidebar = useCallback(() => {
        setIsSidebarActive(false);
    }, []);

    const openWalletModal = useCallback(() => {
        setIsWalletModalOpen(true);
    }, []);

    const closeWalletModal = useCallback(() => {
        setIsWalletModalOpen(false);
    }, []);

    useEffect(() => {
        // close sidebar when the path changes
        closeSidebar();
    }, [ pathname, closeSidebar ]);

    useEffect(() => {
        setIsWalletModalOpen(true);
    }, []);

    return (
        <UserStateProvider
            auth={{
                address,
                message: VERIFY_MESSAGE,
            }}
        >
            <WalletModalContext.Provider
                value={{
                    setIsWalletModalOpen
                }}
            >
                <SideBar 
                    isActive={isSidebarActive}
                    onCloseClick={closeSidebar}
                    onWalletButtonClick={openWalletModal}
                />
                <div className={`
                    w-full h-screen max-h-screen overflow-auto
                    flex flex-col justify-center
                    relative
                `}>
                    <DynamicBackground />
                    <Header forceShow={true}/>
                    <div className='w-screen h-full'>
                        {children}
                    </div>
                    {/* <Footer /> */}
                </div>
            </WalletModalContext.Provider>
        </UserStateProvider>
    )
}

const Layout = ({
    children,
  }: {
    children: React.ReactNode
  }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Mainnet;
  
    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const {theme} = useTheme();

    /* const tiplinkWalletAdapter = useMemo(() => {
        return new TipLinkWalletAdapter({
            title: "summoners dot fun",
            // ask us if you don't have a client id already
            clientId: process.env.NEXT_PUBLIC_TIPLINK_CLIENT_KEY!,
            theme: "light",
            // hideDraggableWidget: true
        });
    }, []); */

    const wallets = useMemo(() => {
        if (typeof window === "undefined") {
            return [];
        }

        const allwalletAdapters = {
            "PhantomWalletAdapter": PhantomWalletAdapter
        }

        const walletAdapters = Object.keys(allwalletAdapters)
                    .filter((key) => key.includes("Adapter"))
                    .map((key) => (allwalletAdapters as any)[key])
                    .map((WalletAdapter: any) => new WalletAdapter());
                    // add TipLinkWalletAdapter to adapters

        // walletAdapters.push(tiplinkWalletAdapter);

        return [...walletAdapters ].filter(
            (item) => item && item.name && item.icon,
        );
    }, [/* tiplinkWalletAdapter */]);
  
    return (
        <CookiesProvider>
          <ConnectionProvider endpoint={endpoint}>
              <UnifiedWalletProvider
                wallets={wallets}
                config={{
                    autoConnect: true,
                    env: 'mainnet-beta',
                    metadata: {
                        name: 'summoners.kidas.app',
                        description: 'PVP on Solana',
                        url: 'https://summoners.kidas.app',
                        iconUrls: ['https://summoners.kidas.app/favicon.ico?v1'],
                    },
                    // notificationCallback: WalletNotification,
                    hardcodedWallets: [
                        {
                          id: "Phantom",
                          name: "Phantom" as any,
                          url: "https://phantom.app/",
                          icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiB2aWV3Qm94PSIwIDAgMTA4IDEwOCIgZmlsbD0ibm9uZSI+CjxyZWN0IHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiByeD0iMjYiIGZpbGw9IiNBQjlGRjIiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00Ni41MjY3IDY5LjkyMjlDNDIuMDA1NCA3Ni44NTA5IDM0LjQyOTIgODUuNjE4MiAyNC4zNDggODUuNjE4MkMxOS41ODI0IDg1LjYxODIgMTUgODMuNjU2MyAxNSA3NS4xMzQyQzE1IDUzLjQzMDUgNDQuNjMyNiAxOS44MzI3IDcyLjEyNjggMTkuODMyN0M4Ny43NjggMTkuODMyNyA5NCAzMC42ODQ2IDk0IDQzLjAwNzlDOTQgNTguODI1OCA4My43MzU1IDc2LjkxMjIgNzMuNTMyMSA3Ni45MTIyQzcwLjI5MzkgNzYuOTEyMiA2OC43MDUzIDc1LjEzNDIgNjguNzA1MyA3Mi4zMTRDNjguNzA1MyA3MS41NzgzIDY4LjgyNzUgNzAuNzgxMiA2OS4wNzE5IDY5LjkyMjlDNjUuNTg5MyA3NS44Njk5IDU4Ljg2ODUgODEuMzg3OCA1Mi41NzU0IDgxLjM4NzhDNDcuOTkzIDgxLjM4NzggNDUuNjcxMyA3OC41MDYzIDQ1LjY3MTMgNzQuNDU5OEM0NS42NzEzIDcyLjk4ODQgNDUuOTc2OCA3MS40NTU2IDQ2LjUyNjcgNjkuOTIyOVpNODMuNjc2MSA0Mi41Nzk0QzgzLjY3NjEgNDYuMTcwNCA4MS41NTc1IDQ3Ljk2NTggNzkuMTg3NSA0Ny45NjU4Qzc2Ljc4MTYgNDcuOTY1OCA3NC42OTg5IDQ2LjE3MDQgNzQuNjk4OSA0Mi41Nzk0Qzc0LjY5ODkgMzguOTg4NSA3Ni43ODE2IDM3LjE5MzEgNzkuMTg3NSAzNy4xOTMxQzgxLjU1NzUgMzcuMTkzMSA4My42NzYxIDM4Ljk4ODUgODMuNjc2MSA0Mi41Nzk0Wk03MC4yMTAzIDQyLjU3OTVDNzAuMjEwMyA0Ni4xNzA0IDY4LjA5MTYgNDcuOTY1OCA2NS43MjE2IDQ3Ljk2NThDNjMuMzE1NyA0Ny45NjU4IDYxLjIzMyA0Ni4xNzA0IDYxLjIzMyA0Mi41Nzk1QzYxLjIzMyAzOC45ODg1IDYzLjMxNTcgMzcuMTkzMSA2NS43MjE2IDM3LjE5MzFDNjguMDkxNiAzNy4xOTMxIDcwLjIxMDMgMzguOTg4NSA3MC4yMTAzIDQyLjU3OTVaIiBmaWxsPSIjRkZGREY4Ii8+Cjwvc3ZnPg==",
                        },
                        {
                          id: "Solflare",
                          name: "Solflare",
                          url: "https://solflare.com/",
                          icon: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgNTAgNTAiIHdpZHRoPSI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGxpbmVhckdyYWRpZW50IGlkPSJhIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmMxMGIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmYjNmMmUiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI2LjQ3ODM1IiB4Mj0iMzQuOTEwNyIgeGxpbms6aHJlZj0iI2EiIHkxPSI3LjkyIiB5Mj0iMzMuNjU5MyIvPjxyYWRpYWxHcmFkaWVudCBpZD0iYyIgY3g9IjAiIGN5PSIwIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDQuOTkyMTg4MzIgMTIuMDYzODc5NjMgLTEyLjE4MTEzNjU1IDUuMDQwNzEwNzQgMjIuNTIwMiAyMC42MTgzKSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHI9IjEiIHhsaW5rOmhyZWY9IiNhIi8+PHBhdGggZD0ibTI1LjE3MDggNDcuOTEwNGMuNTI1IDAgLjk1MDcuNDIxLjk1MDcuOTQwM3MtLjQyNTcuOTQwMi0uOTUwNy45NDAyLS45NTA3LS40MjA5LS45NTA3LS45NDAyLjQyNTctLjk0MDMuOTUwNy0uOTQwM3ptLTEuMDMyOC00NC45MTU2NWMuNDY0Ni4wMzgzNi44Mzk4LjM5MDQuOTAyNy44NDY4MWwxLjEzMDcgOC4yMTU3NGMuMzc5OCAyLjcxNDMgMy42NTM1IDMuODkwNCA1LjY3NDMgMi4wNDU5bDExLjMyOTEtMTAuMzExNThjLjI3MzMtLjI0ODczLjY5ODktLjIzMTQ5Ljk1MDcuMDM4NTEuMjMwOS4yNDc3Mi4yMzc5LjYyNjk3LjAxNjEuODgyNzdsLTkuODc5MSAxMS4zOTU4Yy0xLjgxODcgMi4wOTQyLS40NzY4IDUuMzY0MyAyLjI5NTYgNS41OTc4bDguNzE2OC44NDAzYy40MzQxLjA0MTguNzUxNy40MjM0LjcwOTMuODUyNC0uMDM0OS4zNTM3LS4zMDc0LjYzOTUtLjY2MjguNjk0OWwtOS4xNTk0IDEuNDMwMmMtMi42NTkzLjM2MjUtMy44NjM2IDMuNTExNy0yLjEzMzkgNS41NTc2bDMuMjIgMy43OTYxYy4yNTk0LjMwNTguMjE4OC43NjE1LS4wOTA4IDEuMDE3OC0uMjYyMi4yMTcyLS42NDE5LjIyNTYtLjkxMzguMDIwM2wtMy45Njk0LTIuOTk3OGMtMi4xNDIxLTEuNjEwOS01LjIyOTctLjI0MTctNS40NTYxIDIuNDI0M2wtLjg3NDcgMTAuMzk3NmMtLjAzNjIuNDI5NS0uNDE3OC43NDg3LS44NTI1LjcxMy0uMzY5LS4wMzAzLS42NjcxLS4zMDk3LS43MTcxLS42NzIxbC0xLjM4NzEtMTAuMDQzN2MtLjM3MTctMi43MTQ0LTMuNjQ1NC0zLjg5MDQtNS42NzQzLTIuMDQ1OWwtMTIuMDUxOTUgMTAuOTc0Yy0uMjQ5NDcuMjI3MS0uNjM4MDkuMjExNC0uODY4LS4wMzUtLjIxMDk0LS4yMjYyLS4yMTczNS0uNTcyNC0uMDE0OTMtLjgwNmwxMC41MTgxOC0xMi4xMzg1YzEuODE4Ny0yLjA5NDIuNDg0OS01LjM2NDQtMi4yODc2LTUuNTk3OGwtOC43MTg3Mi0uODQwNWMtLjQzNDEzLS4wNDE4LS43NTE3Mi0uNDIzNS0uNzA5MzYtLjg1MjQuMDM0OTMtLjM1MzcuMzA3MzktLjYzOTQuNjYyNy0uNjk1bDkuMTUzMzgtMS40Mjk5YzIuNjU5NC0uMzYyNSAzLjg3MTgtMy41MTE3IDIuMTQyMS01LjU1NzZsLTIuMTkyLTIuNTg0MWMtLjMyMTctLjM3OTItLjI3MTMtLjk0NDMuMTEyNi0xLjI2MjEuMzI1My0uMjY5NC43OTYzLS4yNzk3IDEuMTMzNC0uMDI0OWwyLjY5MTggMi4wMzQ3YzIuMTQyMSAxLjYxMDkgNS4yMjk3LjI0MTcgNS40NTYxLTIuNDI0M2wuNzI0MS04LjU1OTk4Yy4wNDU3LS41NDA4LjUyNjUtLjk0MjU3IDEuMDczOS0uODk3Mzd6bS0yMy4xODczMyAyMC40Mzk2NWMuNTI1MDQgMCAuOTUwNjcuNDIxLjk1MDY3Ljk0MDNzLS40MjU2My45NDAzLS45NTA2Ny45NDAzYy0uNTI1MDQxIDAtLjk1MDY3LS40MjEtLjk1MDY3LS45NDAzcy40MjU2MjktLjk0MDMuOTUwNjctLjk0MDN6bTQ3LjY3OTczLS45NTQ3Yy41MjUgMCAuOTUwNy40MjEuOTUwNy45NDAzcy0uNDI1Ny45NDAyLS45NTA3Ljk0MDItLjk1MDctLjQyMDktLjk1MDctLjk0MDIuNDI1Ny0uOTQwMy45NTA3LS45NDAzem0tMjQuNjI5Ni0yMi40Nzk3Yy41MjUgMCAuOTUwNi40MjA5NzMuOTUwNi45NDAyNyAwIC41MTkzLS40MjU2Ljk0MDI3LS45NTA2Ljk0MDI3LS41MjUxIDAtLjk1MDctLjQyMDk3LS45NTA3LS45NDAyNyAwLS41MTkyOTcuNDI1Ni0uOTQwMjcuOTUwNy0uOTQwMjd6IiBmaWxsPSJ1cmwoI2IpIi8+PHBhdGggZD0ibTI0LjU3MSAzMi43NzkyYzQuOTU5NiAwIDguOTgwMi0zLjk3NjUgOC45ODAyLTguODgxOSAwLTQuOTA1My00LjAyMDYtOC44ODE5LTguOTgwMi04Ljg4MTlzLTguOTgwMiAzLjk3NjYtOC45ODAyIDguODgxOWMwIDQuOTA1NCA0LjAyMDYgOC44ODE5IDguOTgwMiA4Ljg4MTl6IiBmaWxsPSJ1cmwoI2MpIi8+PC9zdmc+",
                        },
                        {
                          id: "Backpack",
                          name: "Backpack",
                          url: "https://www.backpack.app/",
                          icon: "data:image/png;base64,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",
                        },
                        {
                          id: "Magic Eden",
                          name: "Magic Eden",
                          url: "https://wallet.magiceden.io/",
                          icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiByeD0iMTEzLjc3OCIgZmlsbD0iIzFDMTMyNiIvPgo8cGF0aCBkPSJNMzI2LjYyMyAyMDcuMDA2TDM0Ni4xMjcgMjI5LjkyM0MzNDguMzYgMjMyLjQ5NyAzNTAuMzQgMjM0LjYxNCAzNTEuMTQgMjM1LjgxOEMzNTYuOTczIDI0MS42MTUgMzYwLjI0NCAyNDkuNDUgMzYwLjIzOSAyNTcuNjE0QzM1OS42OTIgMjY3LjI0NSAzNTMuNDE1IDI3My44MDUgMzQ3LjYwMSAyODAuODIxTDMzMy45NTMgMjk2Ljg0NkwzMjYuODMzIDMwNS4xNDlDMzI2LjU3OCAzMDUuNDM1IDMyNi40MTMgMzA1Ljc4OSAzMjYuMzYgMzA2LjE2N0MzMjYuMzA2IDMwNi41NDQgMzI2LjM2NiAzMDYuOTI5IDMyNi41MzEgMzA3LjI3M0MzMjYuNjk3IDMwNy42MTggMzI2Ljk2MiAzMDcuOTA3IDMyNy4yOTIgMzA4LjEwNUMzMjcuNjIzIDMwOC4zMDMgMzI4LjAwNSAzMDguNDAxIDMyOC4zOTIgMzA4LjM4N0gzOTkuNTQzQzQxMC40MTEgMzA4LjM4NyA0MjQuMTAyIDMxNy41MiA0MjMuMzAyIDMzMS4zODdDNDIzLjI4IDMzNy42ODkgNDIwLjcyOSAzNDMuNzI3IDQxNi4yMDcgMzQ4LjE4M0M0MTEuNjg1IDM1Mi42NCA0MDUuNTU5IDM1NS4xNTMgMzk5LjE2NCAzNTUuMTc1SDI4Ny43NEMyODAuNDEgMzU1LjE3NSAyNjAuNjk1IDM1NS45NjQgMjU1LjE3NyAzMzkuMTVDMjU0LjAwMyAzMzUuNjM3IDI1My44NDMgMzMxLjg3MSAyNTQuNzE0IDMyOC4yNzNDMjU2LjMxOCAzMjIuOTUyIDI1OC44NTUgMzE3Ljk1IDI2Mi4yMTIgMzEzLjQ5M0MyNjcuODE1IDMwNS4xOSAyNzMuODgxIDI5Ni44ODcgMjc5Ljg2MyAyODguODMzQzI4Ny41NzIgMjc4LjI4OCAyOTUuNDkyIDI2OC4wNzUgMzAzLjI4NSAyNTcuMzIzQzMwMy41NjIgMjU2Ljk3MyAzMDMuNzEyIDI1Ni41NDIgMzAzLjcxMiAyNTYuMDk4QzMwMy43MTIgMjU1LjY1NSAzMDMuNTYyIDI1NS4yMjQgMzAzLjI4NSAyNTQuODc0TDI3NC45NzYgMjIxLjY2MUMyNzQuNzkyIDIyMS40MiAyNzQuNTUzIDIyMS4yMjUgMjc0LjI3OSAyMjEuMDkxQzI3NC4wMDUgMjIwLjk1NiAyNzMuNzAzIDIyMC44ODYgMjczLjM5NiAyMjAuODg2QzI3My4wOSAyMjAuODg2IDI3Mi43ODggMjIwLjk1NiAyNzIuNTE0IDIyMS4wOTFDMjcyLjI0IDIyMS4yMjUgMjcyLjAwMSAyMjEuNDIgMjcxLjgxNyAyMjEuNjYxQzI2NC4yMzQgMjMxLjc0OSAyMzEuMDM5IDI3Ni40MiAyMjMuOTYyIDI4NS40N0MyMTYuODg0IDI5NC41MjEgMTk5LjQ0NCAyOTUuMDE5IDE4OS43OTcgMjg1LjQ3TDE0NS41MjMgMjQxLjY3MkMxNDUuMjQgMjQxLjM5MiAxNDQuODc5IDI0MS4yMDEgMTQ0LjQ4NyAyNDEuMTI0QzE0NC4wOTQgMjQxLjA0NyAxNDMuNjg2IDI0MS4wODYgMTQzLjMxNiAyNDEuMjM4QzE0Mi45NDYgMjQxLjM4OSAxNDIuNjMgMjQxLjY0NSAxNDIuNDA4IDI0MS45NzRDMTQyLjE4NiAyNDIuMzAyIDE0Mi4wNjggMjQyLjY4OCAxNDIuMDY5IDI0My4wODNWMzI3LjMxOEMxNDIuMTczIDMzMy4yOTYgMTQwLjM3NyAzMzkuMTU2IDEzNi45MzIgMzQ0LjA3N0MxMzMuNDg3IDM0OC45OTggMTI4LjU2NiAzNTIuNzMzIDEyMi44NTkgMzU0Ljc2QzExOS4yMTIgMzU2LjAxMSAxMTUuMzE1IDM1Ni4zODQgMTExLjQ5MiAzNTUuODQ5QzEwNy42NjkgMzU1LjMxNCAxMDQuMDMxIDM1My44ODYgMTAwLjg4MiAzNTEuNjg0Qzk3LjczMjggMzQ5LjQ4MyA5NS4xNjMyIDM0Ni41NzEgOTMuMzg3NyAzNDMuMTkxQzkxLjYxMjEgMzM5LjgxMiA5MC42ODIxIDMzNi4wNjQgOTAuNjc1IDMzMi4yNThWMTgwLjgxQzkwLjkyODggMTc1LjM1MiA5Mi45MjE1IDE3MC4xMTIgOTYuMzcgMTY1LjgzNEM5OS44MTg1IDE2MS41NTYgMTA0LjU0NyAxNTguNDU4IDEwOS44ODQgMTU2Ljk4QzExNC40NjMgMTU1Ljc3OCAxMTkuMjgyIDE1NS43OSAxMjMuODU0IDE1Ny4wMTVDMTI4LjQyNiAxNTguMjQgMTMyLjU4OCAxNjAuNjM0IDEzNS45MTggMTYzLjk1NUwyMDMuOTk0IDIzMS4xMjdDMjA0LjE5OCAyMzEuMzMxIDIwNC40NDQgMjMxLjQ4OCAyMDQuNzE3IDIzMS41ODhDMjA0Ljk4OSAyMzEuNjg3IDIwNS4yOCAyMzEuNzI3IDIwNS41NyAyMzEuNzAzQzIwNS44NTkgMjMxLjY3OSAyMDYuMTQgMjMxLjU5MyAyMDYuMzkyIDIzMS40NUMyMDYuNjQzIDIzMS4zMDggMjA2Ljg2IDIzMS4xMTIgMjA3LjAyNyAyMzAuODc4TDI1NS4zODggMTY0LjkxQzI1Ny42MjIgMTYyLjIzMiAyNjAuNDI0IDE2MC4wNjcgMjYzLjU5NyAxNTguNTY5QzI2Ni43NyAxNTcuMDcgMjcwLjIzNiAxNTYuMjczIDI3My43NTUgMTU2LjIzM0gzOTkuNTQzQzQwMi45ODUgMTU2LjIzOCA0MDYuMzg3IDE1Ni45NjggNDA5LjUyIDE1OC4zNzRDNDEyLjY1MyAxNTkuNzc5IDQxNS40NDYgMTYxLjgyOCA0MTcuNzExIDE2NC4zODJDNDE5Ljk3NiAxNjYuOTM3IDQyMS42NjIgMTY5LjkzOSA0MjIuNjU1IDE3My4xODdDNDIzLjY0OCAxNzYuNDM1IDQyMy45MjYgMTc5Ljg1NSA0MjMuNDcgMTgzLjIxOEM0MjIuNTg0IDE4OS4wNTEgNDE5LjU4MSAxOTQuMzcgNDE1LjAxOCAxOTguMTg3QzQxMC40NTUgMjAyLjAwNCA0MDQuNjQzIDIwNC4wNjEgMzk4LjY1OCAyMDMuOTc2SDMyOC4yMjNDMzI3Ljg2OSAyMDMuOTg0IDMyNy41MjQgMjA0LjA4NiAzMjcuMjI0IDIwNC4yNzFDMzI2LjkyNCAyMDQuNDU1IDMyNi42NzkgMjA0LjcxNiAzMjYuNTE1IDIwNS4wMjVDMzI2LjM1MiAyMDUuMzM1IDMyNi4yNzYgMjA1LjY4MiAzMjYuMjk0IDIwNi4wM0MzMjYuMzEzIDIwNi4zNzkgMzI2LjQyNyAyMDYuNzE2IDMyNi42MjMgMjA3LjAwNloiIGZpbGw9InVybCgjcGFpbnQwX3JhZGlhbF80MDJfMTQ1KSIvPgo8ZGVmcz4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDBfcmFkaWFsXzQwMl8xNDUiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoOTEuNjQyOCAxNTYuMDg3KSByb3RhdGUoMzEuODUyNikgc2NhbGUoMzkzLjE4NyAzMjAuOTA5KSI+CjxzdG9wIHN0b3AtY29sb3I9IiM3NTAwRUIiLz4KPHN0b3Agb2Zmc2V0PSIwLjQ4NjQyIiBzdG9wLWNvbG9yPSIjRTQyNTc1Ii8+CjxzdG9wIG9mZnNldD0iMC43OTE2NjciIHN0b3AtY29sb3I9IiNFNDI1NzUiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY2OTE0Ii8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==",
                        },
                        {
                          id: "Coinbase Wallet",
                          name: "Coinbase Wallet",
                          url: "https://www.coinbase.com/wallet",
                          icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSI1MTIiIGN5PSI1MTIiIHI9IjUxMiIgZmlsbD0iIzAwNTJGRiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1MiA1MTJDMTUyIDcxMC44MjMgMzEzLjE3NyA4NzIgNTEyIDg3MkM3MTAuODIzIDg3MiA4NzIgNzEwLjgyMyA4NzIgNTEyQzg3MiAzMTMuMTc3IDcxMC44MjMgMTUyIDUxMiAxNTJDMzEzLjE3NyAxNTIgMTUyIDMxMy4xNzcgMTUyIDUxMlpNNDIwIDM5NkM0MDYuNzQ1IDM5NiAzOTYgNDA2Ljc0NSAzOTYgNDIwVjYwNEMzOTYgNjE3LjI1NSA0MDYuNzQ1IDYyOCA0MjAgNjI4SDYwNEM2MTcuMjU1IDYyOCA2MjggNjE3LjI1NSA2MjggNjA0VjQyMEM2MjggNDA2Ljc0NSA2MTcuMjU1IDM5NiA2MDQgMzk2SDQyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=",
                        },
                        {
                          id: "OKX Wallet",
                          name: "OKX Wallet",
                          url: "https://www.okx.com/web3",
                          icon: "https://station.jup.ag/img/wallet/glow.png",
                        },
                    ],
                    walletlistExplanation: {
                        href: 'https://station.jup.ag/docs/additional-topics/wallet-list',
                    },
                    theme: theme
                }}
              >
                <Wrapped
                    onOpenTiplink={() => { /* tiplinkWalletAdapter.showWallet(); */ }}
                >
                    {children}
                </Wrapped>
              </UnifiedWalletProvider>
          </ConnectionProvider>
        </CookiesProvider>
    )
}

export const ThemeLayout = ({
    children,
  }: {
    children: React.ReactNode
  }) => {
    return (
        <ThemeProvider>
            <Layout>
                {children}
            </Layout>
        </ThemeProvider>
    )
}

export default ThemeLayout;