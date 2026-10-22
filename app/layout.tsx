import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'AI Practice Tracker | Guidance, cases & commentary',description:'Source-linked AI developments for COLPs, barristers and legal practice. Search, categorise and track your response.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
