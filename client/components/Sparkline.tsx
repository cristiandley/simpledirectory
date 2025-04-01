"use client";

import React from "react";
import { urlService } from "@/lib/api";

type Props = {
  urlId: string;
  width?: number;
  height?: number;
};

export default function Sparkline({ urlId, width = 100, height = 30 }: Props) {
  const [data, setData] = React.useState<{ visitedAt: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const margin = { top: 5, bottom: 5, left: 5, right: 5 };

  React.useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        const visits = await urlService.getUrlVisits(urlId);
        setData(visits);
      } catch (err) {
        console.warn(`Failed to fetch sparkline data for ${urlId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, [urlId]);

  if (loading) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center"
      >
        <span className="text-xs text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center"
      >
        <span className="text-xs text-gray-400">No data</span>
      </div>
    );
  }

  const effectiveWidth = width - margin.left - margin.right;
  const effectiveHeight = height - margin.top - margin.bottom;
  const baseline = height - margin.bottom;

  const pathData =
    data.length === 1
      ? `M ${margin.left} ${baseline} L ${width / 2} ${margin.top} L ${width - margin.right} ${baseline}`
      : data
          .map((_, index) => {
            const x =
              margin.left + (effectiveWidth * index) / (data.length - 1);
            const y =
              index % 2 === 0 ? baseline - effectiveHeight * 0.1 : baseline;
            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ") + ` L ${width - margin.right} ${baseline}`;

  return (
    <svg width={width} height={height}>
      <path
        d={pathData}
        fill="none"
        stroke="#22d3ee"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {data.length === 1 && (
        <circle cx={width / 2} cy={margin.top} r={3} fill="#22d3ee" />
      )}
    </svg>
  );
}
