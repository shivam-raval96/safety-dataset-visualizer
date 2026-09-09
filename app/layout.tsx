import type { Metadata } from 'next';
import { Geist, Newsreader } from 'next/font/google';
import './globals.css';
const geist=Geist({variable:'--font-geist-sans',subsets:['latin']});
const newsreader=Newsreader({variable:'--font-newsreader',subsets:['latin']});
const title='Dataset & Organism Atlas — AI Safety Research Visualizer';
const description='Explore AI safety datasets and the training lineages of model organisms through interactive maps.';
export const metadata:Metadata={metadataBase:new URL('https://shivam-raval96.github.io/safety-dataset-visualizer/'),title,description,openGraph:{title,description,images:['/og.png']},twitter:{card:'summary_large_image',title,description,images:['/og.png']}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body className={`${geist.variable} ${newsreader.variable}`}>{children}</body></html>}
