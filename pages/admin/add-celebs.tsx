"use client";

import { useState } from "react";
import { processCelebrityData } from "@/pages/api/processCelebData";

export const AddCelebritiesPage = () => {
  const [tmdbIds, setTmdbIds] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<string[]>([]);
  const [importBio, setImportBio] = useState(true);
  const [importMoviesOnly, setImportMoviesOnly] = useState(false);

  const handleAddCelebrities = async () => {
    setLoading(true);
    setResults([]);

    const ids = tmdbIds.split(",").map((id) => id.trim());

    for (const id of ids) {
      try {
        const result = await processCelebrityData(id, {
          importBio,
          importMoviesOnly,
        });

        const message = result
          ? `✅ Added ${result.name} successfully.`
          : `❌ Failed to add celebrity with TMDB ID ${id}.`;

        setResults((prevResults) => [message, ...prevResults]);
      } catch (error) {
        setResults((prevResults) => [
          `❌ Error adding TMDB ID ${id}: ${error}`,
          ...prevResults,
        ]);
      }
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Celebrities in Bulk</h1>

      {/* Options */}
      <div className="flex flex-col mb-4 space-y-2">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={importBio}
            onChange={() => setImportBio(!importBio)}
          />
          <span>Import Biographies</span>
        </label>

        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={importMoviesOnly}
            onChange={() => setImportMoviesOnly(!importMoviesOnly)}
          />
          <span>Import Film Credits Only</span>
        </label>
      </div>

      {/* Results */}
      <div className="max-h-[400px] overflow-y-auto border border-gray-300 p-2 mb-4 bg-gray-100 rounded">
        {results.map((result, index) => (
          <p key={index} className="whitespace-pre-wrap">{result}</p>
        ))}
      </div>

      {/* Input + Button */}
      <textarea
        className="w-full p-2 border border-gray-300 rounded mb-4"
        rows={5}
        placeholder="Enter TMDB IDs, separated by commas"
        value={tmdbIds}
        onChange={(e) => setTmdbIds(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleAddCelebrities}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Celebrities"}
      </button>
    </div>
  );
};

export default AddCelebritiesPage;