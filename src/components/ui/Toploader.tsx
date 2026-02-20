"use client";

import NextTopLoader from 'nextjs-toploader';
import { memo } from 'react';

const Toploader = memo(function Toploader() {
    return (
        <NextTopLoader
            color="rgb(var(--color-primary-light))"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px rgb(var(--color-primary-light)),0 0 5px rgb(var(--color-primary-light))"
            zIndex={1600}
            showAtBottom={false}
        />
    );
});

export default Toploader;
