"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Key, CheckCircle, Copy, ExternalLink, Play, FileText, Zap } from "lucide-react"

export function ConfigurationGuide() {
  const [copiedStep, setCopiedStep] = useState<string | null>(null)

  const copyToClipboard = (text: string, step: string) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">WordWise</h1>
          </div>
          <p className="text-gray-600 text-lg">Let&apos;s get your writing assistant configured and ready to use!</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="supabase">Supabase</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Follow these steps to set up your AI Writing Assistant with all the required services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="font-semibold">What you&apos;ll need:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-green-600" />
                        Supabase account (free tier available)
                      </li>
                      <li className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-blue-600" />
                        OpenAI API key (pay-per-use)
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">What you&apos;ll get:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        User authentication & profiles
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Document management & auto-save
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        AI-powered grammar & style checking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Rich text editor with formatting
                      </li>
                    </ul>
                  </div>
                </div>

                <Alert>
                  <Play className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Estimated setup time:</strong> 10-15 minutes
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supabase">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Supabase Setup
                </CardTitle>
                <CardDescription>Set up your database and authentication with Supabase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      1
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium">Create a Supabase Project</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Sign up for a free Supabase account and create a new project.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Supabase Dashboard
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      2
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium">Get Your API Credentials</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Go to Settings &rarr; API in your Supabase project to find your URL and anon key.
                      </p>
                      <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono">
                        <div>Project URL: https://your-project.supabase.co</div>
                        <div>Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6...</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      3
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium">Run the Database Setup Script</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Execute the SQL script in your Supabase SQL editor to create the required tables.
                      </p>
                      <Alert>
                        <AlertDescription>
                          The SQL script is available in the <code>scripts/001-create-tables.sql</code> file in your
                          project.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="openai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  OpenAI Setup
                </CardTitle>
                <CardDescription>Get your OpenAI API key for AI-powered writing assistance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      1
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium">Visit OpenAI Platform</h4>
                      <p className="text-sm text-gray-600 mb-2">Go to the OpenAI Platform to get your API key.</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get API Key
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      2
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium">Create API Key</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Click "Create new secret key" and copy the generated key.
                      </p>
                      <Alert>
                        <AlertDescription>
                          <strong>Important:</strong> Keep your API key secure and never commit it to version control.
                          You&apos;ll need to add credits to your OpenAI account for API usage.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deploy">
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>Set up your environment variables to complete the configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Create .env.local file</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Create a <code>.env.local</code> file in your project root with the following variables:
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">{envTemplate}</pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(envTemplate, "env")}
                    >
                      {copiedStep === "env" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Next Steps:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Replace the placeholder values with your actual credentials</li>
                      <li>Restart your development server</li>
                      <li>The app will automatically redirect you to the authentication page</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
