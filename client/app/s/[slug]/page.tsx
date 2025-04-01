'use client';

import React, { useEffect, useState } from 'react';
import { Spinner } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';
import { urlService } from '@/lib/api';
import variables from "@/config/variables";

export default function SlugRedirectPage() {
    const params = useParams<{ slug: string; }>();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateAndRedirect = async () => {
            if (!params.slug) return;

            try {
                await urlService.getUrlBySlug(params.slug);
                window.location.href = `${variables.apiUrl}/${params.slug}`;
            } catch (err) {
                console.error('Error validating URL:', err);
                router.push('/404');
            }
        };

        validateAndRedirect();
    }, [params.slug, router]);

    // Show a simple loading spinner while validating and redirecting
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
    );
}