'use client';

import React from 'react';
import { addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import UrlForm from '@/components/UrlForm';
import UrlList from '@/components/UrlList';
import { urlService } from '@/lib/api';
import type { Url } from '@/types/url';
import { Image } from "@heroui/image";
import HeroKitty from "@/components/Hero";

export default function HomePage() {
    const [urls, setUrls] = React.useState<Url[]>([]);

    const fetchUrls = React.useCallback(async () => {
        try {
            const data = await urlService.getUrls();
            setUrls(data);
        } catch (err) {
            console.error('Failed to fetch URLs:', err);
            addToast({
                title: 'Failed to load URLs',
                description: 'Please try again later',
                color: 'danger',
                icon: <Icon icon="lucide:x-circle" />
            });
        }
    }, []);

    React.useEffect(() => {
        fetchUrls();
    }, [fetchUrls]);

    const handleDelete = async (id: string) => {
        try {
            await urlService.deleteUrl(id);
            addToast({
                title: 'URL deleted successfully',
                color: 'success',
                icon: <Icon icon="lucide:check" />
            });
            await fetchUrls();
        } catch (err) {
            console.error('Failed to delete URL:', err);
            addToast({
                title: 'Failed to delete URL',
                color: 'danger',
                icon: <Icon icon="lucide:x" />
            });
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="font-extrabold text-4xl">SimpleDirectory</h1>
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

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-100 p-2 rounded-full">
                            <Icon icon="lucide:list" className="text-2xl text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Your Shortened URLs</h2>
                            <p className="text-gray-500 text-sm">
                                Track and manage all your tiny links in one place
                            </p>
                        </div>
                    </div>

                    <UrlList urls={urls} onDelete={handleDelete} />
                </div>

                <div className="text-center text-gray-500 text-sm py-4">
                    <a href="https://github.com/cristiandley">cristiandley</a>
                </div>
            </div>
        </div>
    );
}