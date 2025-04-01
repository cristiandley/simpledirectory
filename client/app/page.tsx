'use client';

import React from 'react';
import { Button, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import UrlForm from '@/components/UrlForm';
import { urlService } from '@/lib/api';
import HeroKitty from "@/components/Hero";
import Link from 'next/link';

export default function HomePage() {
    const [isLoading, setIsLoading] = React.useState(false);

    const fetchUrls = React.useCallback(async () => {
        // This remains for onSuccess callback in UrlForm
        try {
            await urlService.getUrls();
        } catch (err) {
            console.error('Failed to refresh URLs:', err);
            addToast({
                title: 'Failed to refresh URLs',
                description: 'Please try again later',
                color: 'danger',
                icon: <Icon icon="lucide:x-circle" />
            });
        }
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="font-extrabold text-3xl">KittyDirectory</h1>
                <Link href="/urls">
                    <Button
                        color="default"
                        variant="light"
                        endContent={<Icon icon="lucide:external-link" />}
                    >
                        Your URLs
                    </Button>
                </Link>
            </div>

            <div className="">
                <HeroKitty/>
                <div className="p-24 border-l-4 border-r-4 border-b-4 border-[#1a1a1a]">
                    <div className="flex items-center gap-3 mb-4 justify-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-400">Shorten Your URL</h2>
                            <p className="text-gray-500 text-sm">
                                Just paste your long URL and watch the magic happen!
                            </p>
                        </div>
                    </div>
                    <UrlForm onSuccess={fetchUrls} />
                </div>

                <div className="text-center text-gray-500 text-sm py-4">
                    <a href="https://github.com/cristiandley" target="_blank" rel="noopener noreferrer">cristiandley</a>
                </div>
            </div>
        </div>
    );
}