import {Image} from "@heroui/image";
import React from "react";
import { Link } from "@heroui/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Image
                src="/broken_kitty.png"
                width={100}
                height={100}
                alt="Kitty with short legs"
                className="object-contain rounded-xl bg-[#1a1a1a] p-2"
            />
            <p className={"p-8"}>404, URL Not Found</p>
            <p>sad... but good news, you can <Link href="/">create it!</Link></p>
        </div>
    );
}