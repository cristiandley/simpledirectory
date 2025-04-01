'use client';

import React, { useState, useEffect } from 'react';
import { Input, Button, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { urlService } from '@/lib/api';
import type { CreateUrlDto } from '@/types/url';

interface UrlFormProps {
    onSuccess: () => void;
}

export default function UrlForm({ onSuccess }: UrlFormProps) {
    const [url, setUrl] = useState('');
    const [customSlug, setCustomSlug] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [shortenedUrl, setShortenedUrl] = useState('');

    // Load saved email from localStorage on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    // TODO: use ZOD validator or something like that
    const validateEmail = (email: string) => {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const handleSubmit = async () => {
        if (!url) {
            setError('Please enter a URL');
            return;
        }

        // Validate email if provided
        if (email && !validateEmail(email)) {
            addToast({
                title: 'Invalid email format',
                description: 'Please enter a valid email address',
                color: 'warning',
                icon: <Icon icon="lucide:alert-triangle" />
            });
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            setShowResult(false);

            // Save email to localStorage if provided
            if (email) {
                localStorage.setItem('userEmail', email);
            }

            // Create request data
            const data: CreateUrlDto = {
                originalUrl: url,
                ...(customSlug && { customSlug }),
            };
            const result = await urlService.createUrl(data, email || undefined);
            const shortenedURL = `http://localhost:3000/s/${result.url.slug}`;
            addToast({
                title: 'URL shortened successfully!',
                description: 'Your shortened URL is ready to use',
                color: 'success',
                icon: <Icon icon="lucide:check" />
            });
            setShortenedUrl(shortenedURL);
            setShowResult(true);
            setUrl('');
            setCustomSlug('');
            onSuccess();
        } catch (err: any) {
            console.error('Error shortening URL:', err);
            setError(err.response?.data?.message || 'Failed to shorten URL. Please try again.');

            addToast({
                title: 'Failed to shorten URL',
                description: err.response?.data?.message || 'Please try again later',
                color: 'danger',
                icon: <Icon icon="lucide:x" />
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shortenedUrl);
            addToast({
                title: 'Copied to clipboard!',
                color: 'primary',
                icon: <Icon icon="lucide:copy" />
            });
        } catch (err) {
            console.error('Failed to copy:', err);
            addToast({
                title: 'Failed to copy',
                color: 'danger',
                icon: <Icon icon="lucide:x" />
            });
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex flex-col gap-4">
                <Input
                    label="Your URL"
                    placeholder="https://kitty.com/meow/meow/prrr/prrr"
                    value={url}
                    onValueChange={setUrl}
                    variant="bordered"
                    className="border-gray-700 focus:border-gray-500"
                    startContent={<Icon icon="lucide:link" className="text-gray-500" />}
                    isInvalid={!!error}
                    errorMessage={error}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Custom shortcode (optional)"
                        placeholder="my-custom-url"
                        value={customSlug}
                        onValueChange={setCustomSlug}
                        variant="bordered"
                        className="border-gray-700 focus:border-gray-500"
                        startContent={<Icon icon="lucide:tag" className="text-gray-500" />}
                        description="Leave empty for random code"
                    />

                    <Input
                        label="Your email (optional)"
                        placeholder="you@example.com"
                        value={email}
                        onValueChange={setEmail}
                        variant="bordered"
                        className="border-gray-700 focus:border-gray-500"
                        startContent={<Icon icon="lucide:mail" className="text-gray-500" />}
                        description="Associate URLs with your email"
                    />
                </div>

                <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={isLoading}
                    className="w-full font-semibold text-lg py-6"
                    startContent={!isLoading && <Icon icon="lucide:scissors" className="text-xl" />}
                >
                    {isLoading ? "Shortening..." : "Shorten URL"}
                </Button>
            </div>

            {showResult && (
                <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Your shortened URL:</p>
                            <p className="text-lg font-medium word-break-all">{shortenedUrl}</p>
                        </div>
                        <Button
                            color="primary"
                            variant="flat"
                            onPress={copyToClipboard}
                            className="shrink-0"
                            startContent={<Icon icon="lucide:copy" />}
                        >
                            Copy
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}