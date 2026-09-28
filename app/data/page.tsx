"use client"

import type React from "react"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud, FileText, Trash2, LinkIcon, Loader2, Code } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

export default function DataPage() {
  const { toast } = useToast()
  const [importedData, setImportedData] = useState([
    { id: 1, name: "EURUSD_H1_2020-2023.csv", size: "12.5 MB", uploaded: "2024-07-10" },
    { id: 2, name: "GBPUSD_M15_2022.csv", size: "8.1 MB", uploaded: "2024-06-28" },
  ])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dataPrepCode, setDataPrepCode] = useState(
    `import pandas as pd\n\ndef prepare_data(df):\n    # Ensure 'timestamp', 'open', 'high', 'low', 'close', 'volume' columns exist\n    # Example: Rename columns if necessary\n    # df = df.rename(columns={'Time': 'timestamp', 'Open': 'open'})\n    \n    # Convert timestamp to datetime\n    # df['timestamp'] = pd.to_datetime(df['timestamp'])\n    \n    # Handle missing values, clean outliers, etc.\n    # df = df.dropna()\n    \n    # Return processed DataFrame\n    return df\n\n# Example usage (conceptual):\n# raw_data = pd.read_csv('your_uploaded_file.csv')\n# processed_data = prepare_data(raw_data)\n# print(processed_data.head())`,
  )
  const [dataPrepLog, setDataPrepLog] = useState("")
  const [isPreparingData, setIsPreparingData] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

  const handleUploadData = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please choose a CSV file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    toast({
      title: "Uploading data...",
      description: `Uploading ${selectedFile.name}.`,
      variant: "default",
    })

    setTimeout(() => {
      const newId = importedData.length > 0 ? Math.max(...importedData.map((d) => d.id)) + 1 : 1
      const newEntry = {
        id: newId,
        name: selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploaded: new Date().toISOString().split("T")[0],
      }
      setImportedData((prev) => [...prev, newEntry])
      setSelectedFile(null) // Clear file input
      toast({
        title: "Upload Complete!",
        description: `${selectedFile.name} has been successfully uploaded.`,
        variant: "success",
      })
      setIsUploading(false)
    }, 2000) // Simulate upload time
  }

  const handleDeleteData = (id: number, name: string) => {
    setImportedData((prev) => prev.filter((data) => data.id !== id))
    toast({
      title: "Data Deleted",
      description: `${name} has been removed.`,
      variant: "default",
    })
  }

  const handlePrepareData = () => {
    setIsPreparingData(true)
    setDataPrepLog("Executing data preparation script...\n")

    setTimeout(() => {
      const randomSuccess = Math.random() > 0.3 // 70% success rate
      if (randomSuccess) {
        setDataPrepLog(
          (prev) =>
            prev +
            "Data prepared successfully! Columns matched: timestamp, open, high, low, close, volume.\nReady for backtesting.",
        )
        toast({
          title: "Data Preparation Successful!",
          description: "Your data is ready for backtesting.",
          variant: "default",
        })
      } else {
        setDataPrepLog(
          (prev) =>
            prev + "Data preparation failed: Missing required column 'volume'. Please adjust your script or data.\n",
        )
        toast({
          title: "Data Preparation Failed!",
          description: "Check the log for details.",
          variant: "destructive",
        })
      }
      setIsPreparingData(false)
    }, 2500) // Simulate data prep time
  }

  return (
    <div className="min-h-screen bg-spotify-black font-sans text-spotify-text-primary py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="font-display text-3xl font-bold text-spotify-text-primary mb-4 animate-fade-in-up">
          Market Data Management
        </h1>
        <p className="text-spotify-text-secondary text-sm mb-8 animate-fade-in-up animation-delay-200">
          Manage your imported historical market data files and prepare them for backtesting.
        </p>

        <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-6 mb-8 animate-fade-in-up animation-delay-300 rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-spotify-text-primary">Upload New Data</CardTitle>
            <CardDescription className="text-sm text-spotify-text-secondary">
              Upload CSV files containing historical market data for backtesting.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="data-file" className="text-sm text-spotify-text-primary">
                Select File
              </Label>
              <Input
                id="data-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="text-sm border-spotify-grey focus:border-spotify-green bg-spotify-black text-spotify-text-primary rounded-md"
              />
            </div>
            <Button
              onClick={handleUploadData}
              disabled={isUploading || !selectedFile}
              className="w-full bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-spotify-grey bg-spotify-dark-grey p-6 mb-8 animate-fade-in-up animation-delay-400 rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-spotify-text-primary">
              Prepare Data (Python/Pandas)
            </CardTitle>
            <CardDescription className="text-sm text-spotify-text-secondary">
              Use the editor to write Python code (with Pandas) to clean and format your data. Ensure it has
              'timestamp', 'open', 'high', 'low', 'close', and 'volume' columns.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="data-prep-code" className="text-sm text-spotify-text-primary">
                Python Data Preparation Script
              </Label>
              <Textarea
                id="data-prep-code"
                value={dataPrepCode}
                onChange={(e) => setDataPrepCode(e.target.value)}
                placeholder="Write your Python/Pandas data preparation script here..."
                className="h-64 font-mono text-sm bg-spotify-black border-spotify-grey text-spotify-text-primary rounded-md"
              />
            </div>
            <Button
              onClick={handlePrepareData}
              disabled={isPreparingData || dataPrepCode.trim() === ""}
              className="w-full bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
            >
              {isPreparingData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Data...
                </>
              ) : (
                <>
                  <Code className="mr-2 h-4 w-4" /> Run Data Preparation
                </>
              )}
            </Button>
            {dataPrepLog && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-spotify-text-primary flex items-center mb-2">
                  Data Preparation Log:
                </h3>
                <pre className="bg-spotify-black p-3 rounded-md text-xs font-mono overflow-auto max-h-40 text-spotify-text-secondary border border-spotify-grey">
                  {dataPrepLog}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <section className="space-y-4 mt-12">
          <h2 className="font-display text-2xl font-bold text-spotify-text-primary animate-fade-in-up animation-delay-500">
            My Imported Data
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {importedData.map((data, index) => (
              <Card
                key={data.id}
                className="flex items-center justify-between p-4 shadow-sm border-spotify-grey bg-spotify-dark-grey animate-fade-in-up rounded-lg"
                style={{ animationDelay: `${500 + index * 75}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-spotify-green" />
                  <div>
                    <p className="text-sm font-medium text-spotify-text-primary">{data.name}</p>
                    <p className="text-xs text-spotify-text-secondary">
                      {data.size} | Uploaded: {data.uploaded}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-destructive-foreground/10 text-destructive-foreground hover:bg-destructive-foreground/20 transition-all duration-200 hover:scale-105 rounded-full"
                  onClick={() => handleDeleteData(data.id, data.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
            {importedData.length === 0 && (
              <p className="text-center text-spotify-text-secondary text-sm animate-fade-in-up animation-delay-600">
                No data files imported yet.
              </p>
            )}
          </div>
        </section>

        {/* Page-specific CTA */}
        <div className="mt-12 text-center animate-fade-in-up animation-delay-700">
          <h2 className="font-display text-2xl font-bold text-spotify-text-primary mb-4">Need More Data?</h2>
          <p className="text-spotify-text-secondary text-sm mb-6">
            Upload your custom datasets or connect to live brokers for real-time feeds (Deriv, Binance, Kraken, FXCM,
            IG, OANDA).
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/data?action=upload">
              <Button
                size="lg"
                className="bg-spotify-green text-spotify-black hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 rounded-full"
              >
                Upload New Data
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-spotify-grey text-spotify-text-primary hover:bg-spotify-grey bg-transparent transition-all duration-300 hover:scale-105 rounded-full"
              onClick={() =>
                toast({
                  title: "Integration Coming Soon!",
                  description: "Broker integrations will be available in future updates.",
                  variant: "default",
                })
              }
            >
              <LinkIcon className="mr-2 h-4 w-4" /> Connect to Broker
            </Button>
          </div>
        </div>
      </div>
      <footer className="py-8 text-center text-xs text-spotify-text-secondary border-t border-spotify-grey bg-spotify-dark-grey mt-8">
        <div className="container mx-auto max-w-6xl px-4">
          &copy; {new Date().getFullYear()} BotForge. All rights reserved. Made by{" "}
          <a
            href="https://hummzer.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-spotify-green hover:underline"
          >
            Hummzer
          </a>
          .
        </div>
      </footer>
    </div>
  )
}
