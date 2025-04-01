'use client';

import React from 'react';
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button, Tooltip, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { Url } from '@/types/url';

interface UrlListProps {
    urls: Url[];
    onDelete: (id: string) => void;
}

export default function UrlList({ urls, onDelete }: UrlListProps) {
    const copyToClipboard = async (slug: string) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const fullUrl = `${baseUrl}/${slug}`;

            await navigator.clipboard.writeText(fullUrl);

            addToast({
                title: 'Copied to clipboard!',
                description: fullUrl,
                color: 'primary',
                icon: <Icon icon="lucide:copy" />,
            });
        } catch (err) {
            console.error('Failed to copy:', err);

            addToast({
                title: 'Failed to copy to clipboard',
                color: 'danger',
                icon: <Icon icon="lucide:x" />
            });
        }
    };

    return (
        <Table removeWrapper aria-label="URLs list" className="w-full">
            <TableHeader>
                <TableColumn>Original URL</TableColumn>
                <TableColumn>Short URL</TableColumn>
                <TableColumn>Visits</TableColumn>
                <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
                {urls.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4}>
                            <div className="text-center p-4">No URLs found. Create your first shortened URL above!</div>
                        </TableCell>
                    </TableRow>
                ) : (
                    urls.map((url) => (
                        <TableRow key={url.id}>
                            <TableCell className="max-w-xs truncate">{url.originalUrl}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{url.slug}</span>
                                    <Tooltip content="Copy shortened URL">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onPress={() => copyToClipboard(url.slug)}
                                        >
                                            <Icon icon="lucide:copy" className="text-lg" />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </TableCell>
                            <TableCell>{url.visits}</TableCell>
                            <TableCell>
                                <Button
                                    isIconOnly
                                    color="danger"
                                    variant="light"
                                    size="sm"
                                    onPress={() => onDelete(url.id)}
                                >
                                    <Icon icon="lucide:trash-2" className="text-lg" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}