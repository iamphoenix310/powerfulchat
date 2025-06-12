'use client';

import { client, newsClient, urlFor } from "@/app/utils/sanityClient";
import { CelebrityAdminTools } from "@/components/Admin/CelebrityAdminTools";
import AdBlock from "@/components/Ads/AdBlock";
import JsonLd from "@/components/jsonLd";
import FeedbackForm from "@/components/People/feedbackForm";
import PersonRatingSection from '@/components/People/Ratings/PersonRatingSection';
import SimilarPeople from "@/components/People/similarPeople";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PortableTextRenderer from "../Shared/PortableTextRenderer";
import PersonNewsSection from "./PersonNewsSection";
import PowerMeter from "./powerMeter";

import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

import {
  ArrowLeftIcon,
  LinkIcon,
  UserCircleIcon
} from "@heroicons/react/24/solid";

interface Slug {
  current: string;
}

interface PersonMain {
  votedUsers: { _id: string; username?: string | undefined; name?: string | undefined; image?: any; }[] | undefined;
  numberofratings: number;
  facerating: number;
  eyesrating: number;
  lipsrating: number;
  actingrating: number;
  voicerating: number;
  modellingrating: number;
  politicsrating: number;
  skillsToRate: string[] | undefined;
  tmdbId: any;
  expandedBiography: any;
  _id: string;
  name: string;
  profession: string[];
  powerMeter: number;
  image: any;
  slug: Slug;
  description: string;
  intro: any;
  height: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  gender: string;
  country: string;
  dob: string;
  deathDate?: string;
  isDead: boolean;
  ethnicity: string[];
  seoContentBlocks?: {
    _key: string;
    keyword: string;
    answer: string;
  }[];
}

interface PersonPageProps {
  slug: string;
}

const PersonPage: React.FC<PersonPageProps> = ({ slug }) => {
  const [person, setPerson] = useState<PersonMain | null>(null);
  const [isBirthday, setIsBirthday] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedBio, setExpandedBio] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerson = async () => {
      setIsLoading(true);
      const query = `*[_type == "facesCelebs" && slug.current == $slug][0]{
        ...,
        tmdbId,
        votedUsers[]->{
          _id,
          name,
          username,
          profileImage
        }
      }`;

      try {
        let result = await newsClient.fetch(query, { slug });

        if (result) {
          const today = new Date();
          const dob = new Date(result.dob);
          if (today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate()) {
            setIsBirthday(true);
          }
          setPerson(result);
          client.patch(result._id).inc({ powerMeter: 1 }).commit().catch(() => {});
        }
      } catch (err) {
        console.error("Failed to fetch person:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerson();
  }, [slug]);

  const calculateAge = (dob: string, endDate?: string) => {
    const birth = new Date(dob);
    const end = endDate ? new Date(endDate) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
    return age;
  };

  const currentUrl = useMemo(() => (typeof window !== "undefined" ? window.location.href : ""), []);
  const formatDisplayDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

  const DetailItem = ({ label, value }: { label: string; value?: string | string[] }) => {
    if (!value) return null;
    return (
      <div>
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="text-slate-800 dark:text-slate-100">{Array.isArray(value) ? value.join(", ") : value}</dd>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh] bg-slate-50 dark:bg-slate-900">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Person not found</h1>
        <Link href="/people" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Directory</Link>
      </div>
    );
  }

  return (
    <>
      {person && <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: person.name,
        birthDate: person.dob,
        image: person.image ? urlFor(person.image) : undefined,
        ...(person.isDead && { deathDate: person.deathDate }),
        jobTitle: person.profession.join(", "),
        gender: person.gender,
        nationality: person.country
      }} />}

      <div className="max-w-6xl mx-auto px-4 py-10 text-slate-800 dark:text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/people" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to People Directory
          </Link>
        </div>

        <div className="flex flex-col items-center sm:flex-row sm:items-start md:grid md:grid-cols-[1fr_2fr_1fr] md:gap-8 lg:grid-cols-[.7fr_2.3fr_1fr] mb-10">
          <div className="relative w-40 h-48 sm:w-40 sm:h-40 md:w-full md:aspect-[3/4] md:max-w-[250px] md:min-h-[250px] md:max-h-[400px] flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 md:mr-0 bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden shadow-md">
            {person.image ? (
              <Image
                src={urlFor(person.image)}
                alt={person.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 250px"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-800">
                <UserCircleIcon className="w-20 h-20 text-slate-400" />
              </div>
            )}
            {isBirthday && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 text-white text-center text-xs py-1 font-semibold">
                🎂 Happy Birthday {person.name.split(" ")[0]}!
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2 md:space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{person.name}</h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium mb-4">
              {person.profession.join(" / ")}
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mt-4">
              <DetailItem label="Born" value={formatDisplayDate(person.dob)} />
              <DetailItem label="Country" value={person.country} />
              <DetailItem label="Gender" value={person.gender} />
              <DetailItem label="Ethnicity" value={person.ethnicity} />
              <DetailItem label="Height" value={person.height} />
              <DetailItem label="Hair" value={person.hairColor} />
              <DetailItem label="Eyes" value={person.eyeColor} />
              <DetailItem label="Body Type" value={person.bodyType} />
              {person.isDead && <DetailItem label="Died" value={formatDisplayDate(person.deathDate)} />}
              {person.dob && (
                <DetailItem
                  label={person.isDead ? "Age at Death" : "Age"}
                  value={`${calculateAge(person.dob, person.deathDate)} years`}
                />
              )}
            </div>

            <div className="pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-1">Power Meter</p>
              <PowerMeter value={person.powerMeter} />
            </div>
          </div>

          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm self-start sticky top-24">
            <AdBlock adSlot="8397118667" />
          </div>
        </div>

        <PersonRatingSection
          personId={person._id}
          profession={person.profession}
          defaultValues={{
            facerating: person.facerating ?? 50,
            numberofratings: person.numberofratings,
            eyesrating: person.eyesrating ?? 50,
            lipsrating: person.lipsrating ?? 50,
            actingrating: person.actingrating ?? 50,
            voicerating: person.voicerating ?? 50,
            modellingrating: person.modellingrating ?? 50,
            politicsrating: person.politicsrating ?? 50
          }}
          votedUsers={person.votedUsers}
          personName={person.name}
          image={person.image}
          skillsOverride={person.skillsToRate}
        />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow px-6 py-4 mb-10">
          <div className="flex flex-wrap justify-center gap-3">
            <FacebookShareButton url={currentUrl}><FacebookIcon size={36} round /></FacebookShareButton>
            <TwitterShareButton url={currentUrl}><TwitterIcon size={36} round /></TwitterShareButton>
            <WhatsappShareButton url={currentUrl}><WhatsappIcon size={36} round /></WhatsappShareButton>
            <EmailShareButton url={currentUrl}><EmailIcon size={36} round /></EmailShareButton>
            <CopyToClipboard text={currentUrl} onCopy={() => toast.success("Link copied!")}>
              <button className="bg-slate-200 dark:bg-slate-700 hover:bg-blue-500 text-slate-700 dark:text-slate-100 hover:text-white rounded-full p-2">
                <LinkIcon className="w-5 h-5" />
              </button>
            </CopyToClipboard>
          </div>
        </div>

        {person.intro && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow">
              <PortableTextRenderer value={person.intro} />
            </div>
          </section>
        )}

        <PersonNewsSection personName={person.name} />

        {person.expandedBiography && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 mt-6">Expanded Biography</h2>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow">
              <PortableTextRenderer value={person.expandedBiography} />
            </div>
          </section>
        )}

        <AdBlock adSlot="9995634858" className="my-10 rounded-lg overflow-hidden" />

        {person.seoContentBlocks && person.seoContentBlocks.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-center">More Insights on {person.name}</h2>
            <div className="space-y-8">
              {person.seoContentBlocks.map((block, idx) => (
                <div key={block._key || idx}>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-2">{block.keyword}</h3>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{block.answer}</p>
                  </div>
                  {(idx + 1) % 2 === 0 && (
                    <AdBlock adSlot="9995634858" className="my-8 rounded-lg overflow-hidden" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Send Feedback or Corrections</h2>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
            <FeedbackForm
              personName={person.name}
              onSubmit={async (message) => {
                try {
                  const res = await fetch("/api/sendFeedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ personName: person.name, message }),
                  });
                  res.ok ? toast.success("Feedback sent!") : toast.error("Error sending feedback.");
                } catch (e) {
                  toast.error("Failed to send feedback.");
                }
              }}
            />
          </div>
        </section>

        <AdBlock adSlot="5382119347" className="my-10 rounded-lg overflow-hidden" />

        <section className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-center">Discover Similar Profiles</h2>
          <SimilarPeople
            currentPersonId={person._id}
            profession={person.profession}
            country={person.country}
            gender={person.gender}
          />
        </section>

        {person.tmdbId && (
          <div className="mt-12">
            <CelebrityAdminTools tmdbId={String(person.tmdbId)} />
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/people" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to People Directory
        </Link>
      </div>
    </>
  );
};

export default PersonPage;
