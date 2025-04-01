'use client';

import React, { useState } from 'react';
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!url) {
            setError('Please enter a URL');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            const data: CreateUrlDto = {
                originalUrl: url,
                ...(customSlug && { customSlug }),
            };
            const result = await urlService.createUrl(data);
            addToast({
                title: 'URL shortened successfully! 🎉',
                description: result.shortenedUrl,
                color: 'success',
                icon: <Icon icon="lucide:check" />,
            });

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

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <div className="flex flex-col gap-4">
                <Input
                    label="Enter URL"
                    placeholder="https://kitty.com"
                    value={url}
                    onValueChange={setUrl}
                    variant="bordered"
                    startContent={<Icon icon="lucide:link" className="text-default-400" />}
                    isInvalid={!!error}
                    errorMessage={error}
                />
                <Input
                    label="Custom Slug (Optional)"
                    placeholder="custom-name"
                    value={customSlug}
                    onValueChange={setCustomSlug}
                    variant="bordered"
                    startContent={<Icon icon="lucide:tag" className="text-default-400" />}
                />
                <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={isLoading}
                    className="w-full"
                >
                    Shorten URL
                </Button>
            </div>
        </div>
    );
}