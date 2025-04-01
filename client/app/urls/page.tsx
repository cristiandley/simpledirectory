'use client';

import React from 'react';
import { Button, addToast, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import UrlList from '@/components/UrlList';
import { urlService } from '@/lib/api';
import type { Url } from '@/types/url';
import Link from 'next/link';

export default function UrlsPage() {
    const [urls, setUrls] = React.useState<Url[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [userIdFilter, setUserIdFilter] = React.useState<string | null>(null);

    const fetchUrls = React.useCallback(async (userId?: string) => {
        try {
            setIsLoading(true);
            const data = await urlService.getUrls(userId || undefined);
            setUrls(data);
        } catch (err) {
            console.error('Failed to load URLs:', err);
            addToast({
                title: 'Failed to load URLs',
                description: 'Please try again later',
                color: 'danger',
                icon: <Icon icon="lucide:x-circle" />
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchUrls();

        // Check if there's a saved email in localStorage
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setUserIdFilter(savedEmail);
            fetchUrls(savedEmail);
        }
    }, [fetchUrls]);

    const handleDelete = async (id: string) => {
        try {
            await urlService.deleteUrl(id, userIdFilter || undefined);
            addToast({
                title: 'URL deleted successfully',
                color: 'success',
                icon: <Icon icon="lucide:check" />
            });
            await fetchUrls(userIdFilter || undefined);
        } catch (err) {
            console.error('Failed to delete URL:', err);
            addToast({
                title: 'Failed to delete URL',
                color: 'danger',
                icon: <Icon icon="lucide:x" />
            });
        }
    };

    const applyEmailFilter = () => {
        if (email) {
            localStorage.setItem('userEmail', email);
            setUserIdFilter(email);
            fetchUrls(email);

            addToast({
                title: 'Filtering by email',
                description: `Showing URLs for ${email}`,
                color: 'primary',
                icon: <Icon icon="lucide:filter" />
            });
        }
    };

    const clearEmailFilter = () => {
        setEmail('');
        setUserIdFilter(null);
        localStorage.removeItem('userEmail');
        fetchUrls();

        addToast({
            title: 'Filter cleared',
            description: 'Showing all URLs',
            color: 'primary',
            icon: <Icon icon="lucide:x" />
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="font-extrabold text-4xl">Your URLs</h1>
                <Link href="/">
                    <Button
                        color="default"
                        variant="light"
                        startContent={<Icon icon="lucide:arrow-left" />}
                    >
                        Back to Shortener
                    </Button>
                </Link>
            </div>

            <div>
                <div className="p-6 border-4 border-[#1a1a1a] bg-black text-white">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                        <div className="flex-grow">
                            <h2 className="text-xl font-bold">Email Filter</h2>
                            <p className="text-gray-400 text-sm">
                                Filter URLs by email to see only yours
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            <Input
                                placeholder="Enter your email"
                                value={email}
                                onValueChange={setEmail}
                                variant="bordered"
                                startContent={<Icon icon="lucide:mail" className="text-gray-500" />}
                                className="w-full md:w-64"
                                classNames={{
                                    inputWrapper: "bg-[#1a1a1a] border-gray-700",
                                    input: "text-white"
                                }}
                            />
                            <div className="flex gap-2">
                                <Button
                                    color="primary"
                                    onPress={applyEmailFilter}
                                    isDisabled={!email}
                                >
                                    Apply Filter
                                </Button>
                                {userIdFilter && (
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        onPress={clearEmailFilter}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {userIdFilter && (
                        <div className="mb-4 px-4 py-2 bg-[#2d2d2d] rounded-md inline-block">
                            <span className="text-sm mr-2">Filtering by:</span>
                            <span className="font-medium">{userIdFilter}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 border-l-4 border-r-4 border-b-4 border-[#1a1a1a]">
                    <div className="flex items-center gap-3 mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-600">Your Shortened URLs</h2>
                            <p className="text-gray-500 text-sm">
                                Track and manage all your tiny links in one place
                            </p>
                        </div>
                    </div>

                    <UrlList
                        urls={urls}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}