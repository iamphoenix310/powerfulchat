import AnimeStudio from "@/components/Modal/ImageGeneration/AnimeStudio";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Generate Ghibli or Pixar and More Style Images',
    description: 'Generate anime images using various models',
}

export default function GeneratePage() {
    return (
        <div className="max-w-[70%] mx-auto">
        <AnimeStudio />
        </div>
    )  
}

