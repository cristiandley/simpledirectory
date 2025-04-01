import {Image} from "@heroui/image";
import {Icon} from "@iconify/react";
import React from "react";

export default function HeroKitty() {
    return (
        <div className="bg-black p-8 md:p-8 border-4 border-[#1a1a1a]">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">

                <div className="flex items-center gap-4 flex-wrap justify-center text-white">
                    <div className="flex flex-col items-center text-center">
                        <Image
                            src="/long_kitty.png"
                            width={100}
                            height={100}
                            alt="Kitty with long legs"
                            className="object-contain rounded-xl bg-[#1a1a1a] p-2"
                        />
                        <span className="text-sm font-medium mt-1">dark_kitty.com/m/e/o/o/w</span>
                    </div>

                    <Icon
                        icon="lucide:arrow-right"
                        className="hidden md:block text-3xl md:text-4xl mx-2"
                    />

                    <div className="flex flex-col items-center text-center">
                        <Image
                            src="/short_kitty.png"
                            width={100}
                            height={100}
                            alt="Kitty with short legs"
                            className="object-contain rounded-xl bg-[#1a1a1a] p-2"
                        />
                        <span className="text-sm font-medium mt-1">kt.gg/MeEoW</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
