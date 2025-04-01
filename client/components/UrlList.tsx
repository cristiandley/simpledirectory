"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Tooltip,
  Badge,
  addToast,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import type { Url } from "@/types/url";
import { urlService } from "@/lib/api";
import Sparkline from "./Sparkline";

interface UrlListProps {
  urls: Url[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function UrlList({
  urls,
  onDelete,
  isLoading = false,
}: UrlListProps) {
  const [visitLogs, setVisitLogs] = React.useState<
    Record<string, { visitedAt: string }[]>
  >({});

  React.useEffect(() => {
    const fetchAllVisits = async () => {
      const visitMap: Record<string, { visitedAt: string }[]> = {};
      await Promise.all(
        urls.map(async (url) => {
          try {
            const data = await urlService.getUrlVisits(url.id);
            visitMap[url.id] = data;
          } catch (err) {
            console.warn(`Failed to fetch visits for URL ${url.id}`);
            visitMap[url.id] = [];
          }
        }),
      );
      setVisitLogs(visitMap);
    };

    if (urls.length) fetchAllVisits();
  }, [urls]);

  const copyToClipboard = async (slug: string) => {
    try {
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/s/${slug}`;
      await navigator.clipboard.writeText(fullUrl);
      addToast({
        title: "URL copied to clipboard!",
        description: fullUrl,
        color: "primary",
        icon: <Icon icon="lucide:copy" />,
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      addToast({
        title: "Failed to copy to clipboard",
        color: "danger",
        icon: <Icon icon="lucide:x" />,
      });
    }
  };

  const openUrl = (slug: string) => {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/s/${slug}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-gray-500 mt-4">Loading URLs...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {urls.length === 0 ? (
        <div className="text-center py-12 bg-gray-500 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-300 mb-1">No URLs found</p>
          <p className="text-sm text-gray-300">
            Shorten your first URL to see it here!
          </p>
        </div>
      ) : (
        <Table removeWrapper aria-label="URLs list" className="w-full">
          <TableHeader>
            <TableColumn>ORIGINAL URL</TableColumn>
            <TableColumn>SHORT URL</TableColumn>
            <TableColumn>VISITS</TableColumn>
            <TableColumn>SPARKLINE</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {urls.map((url) => (
              <TableRow key={url.id}>
                <TableCell className="max-w-[30px] truncate">
                  <Tooltip content={url.originalUrl}>
                    <span>{url.originalUrl}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      color="primary"
                      variant="flat"
                      className="text-xs font-mono px-2"
                    >
                      {url.slug}
                    </Badge>
                    <div className="flex gap-1">
                      <Tooltip content="Copy shortened URL">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-blue-500"
                          onPress={() => copyToClipboard(url.slug)}
                        >
                          <Icon icon="lucide:copy" className="text-lg" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Open in new tab">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-purple-500"
                          onPress={() => openUrl(url.slug)}
                        >
                          <Icon
                            icon="lucide:external-link"
                            className="text-lg"
                          />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color="success" variant="flat" className="text-xs">
                    <Icon icon="lucide:eye" className="mr-1" /> {url.visits}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Sparkline urlId={url.id} />
                </TableCell>
                <TableCell>
                  <Tooltip content="Delete URL" color="danger">
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      size="sm"
                      onPress={() => onDelete(url.id)}
                    >
                      <Icon icon="lucide:trash-2" className="text-lg" />
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
