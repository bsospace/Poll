import { useState } from "react";
import FlipCard from "@/components/animata/card/flip-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scan, LogIn, Shield, Vote } from "lucide-react";
import { useAuth } from "@/hooks/UseAuth";
import { FaDiscord, FaGithub, FaGoogle } from "react-icons/fa";
import QRScanner from "@/components/qrcode/QrcodeScanner";
import { toast } from "sonner";
import { config } from "@/config/Config";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const [flip, setFlip] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { oauthLogin, loginGuest } = useAuth();

  interface QRCodeResult {
    text: string;
  }

  const handleQRCodeScanned = (result: QRCodeResult | null) => {
    if (!result?.text) return;

    let jsonText = result.text.trim(); // Remove leading/trailing spaces
    let modified = false; // Track if we modified the JSON

    try {
      let parsedResult;

      // First, try parsing normally (for correctly formatted JSON)
      if (jsonText.startsWith("{") && jsonText.endsWith("}")) {
        try {
          parsedResult = JSON.parse(jsonText);
        } catch {
          // If parsing fails, try fixing unquoted keys
          jsonText = jsonText.replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":');
          modified = true; // Mark as modified
          parsedResult = JSON.parse(jsonText);
        }
      } else {
        console.error("Invalid JSON format:", jsonText);
        toast.error("Invalid QR code format. Please scan a valid QR code.");
        return;
      }

      // If JSON parsing succeeds but "key" is missing, show a toast notification
      if (parsedResult && typeof parsedResult === "object") {
        if ("key" in parsedResult) {
          console.log("QR Code Scanned:", parsedResult);
          setAccessKey(parsedResult.key);
        } else if (modified) {
          console.error("Modified JSON, but 'key' attribute is missing:", jsonText);
          toast.error("QR code is invalid. Missing 'key' attribute.");
        } else {
          console.error("Valid JSON, but 'key' attribute is missing:", jsonText);
          toast.error("The scanned QR code is missing the 'key' attribute.");
        }
      } else {
        console.error("Invalid QR code format after parsing:", jsonText);
        toast.error("Invalid QR code data. Please scan a valid QR code.");
      }
    } catch (error) {
      console.error("Error parsing QR code:", error, "Received text:", result.text);
      toast.error("Error reading the QR code. Please try again.");
    } finally {
      setShowScanner(false);
    }
  };
  

  const handleGuestAccess = () => {
    if (!accessKey) return;
    loginGuest(accessKey, "/");
  };

  interface OAuthButtonProps {
    provider: "discord" | "github" | "google";
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    hoverColor: string;
  }

  const OAuthButton = ({ provider, icon: Icon, color, hoverColor }: OAuthButtonProps) => (
    <Button
      className={`w-full rounded-xl py-6 flex items-center justify-center space-x-3 ${color} ${hoverColor} text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
      onClick={() => oauthLogin(provider)}
      disabled={!acceptedTerms}
    >
      <Icon className="w-6 h-6" />
      <span className="text-base">Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
    </Button>
  );

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-orange-400 to-red-300 blur-3xl opacity-40 -top-20 -left-20 animate-pulse"></div>
      <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-yellow-300 to-orange-200 blur-3xl opacity-40 -bottom-32 -right-20 animate-pulse" style={{ animationDelay: "1.5s" }}></div>

      <div className="w-full max-w-md z-10">
        <Card className="w-full h-full md:h-fit md:w-fit border-none shadow-none md:shadow-2xl md:rounded-3xl bg-transparent md:bg-white/90 md:backdrop-blur-xl p-10 border md:border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-600 to-red-500 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <Vote className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-700 to-red-600 bg-clip-text text-transparent">Welcome to</h1>
            <p className="text-gray-600 mt-2 font-medium">{config.appName}</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100/80 rounded-full p-1 shadow-inner">
              <Button
                variant="ghost"
                onClick={() => setFlip(false)}
                className={`rounded-full px-10 py-2.5 transition-all duration-300 font-medium ${!flip ? "bg-white text-orange-700 shadow-md" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Sign in
              </Button>
              <Button
                variant="ghost"
                onClick={() => setFlip(true)}
                className={`rounded-full px-10 py-2.5 transition-all duration-300 font-medium ${flip ? "bg-white text-orange-700 shadow-md" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Guest
              </Button>
            </div>
          </div>

          {/* Flip Card Content */}
          <FlipCard
            flip={flip}
            frontContent={
              <div className="space-y-6">
                <OAuthButton provider="google" icon={FaGoogle} color="bg-red-500" hoverColor="hover:bg-red-600" />
                <OAuthButton provider="discord" icon={FaDiscord} color="bg-indigo-600" hoverColor="hover:bg-indigo-700" />
                <OAuthButton provider="github" icon={FaGithub} color="bg-gray-800" hoverColor="hover:bg-gray-900" />

                {/* Terms Checkbox */}
                <div className="flex items-start space-x-3 bg-orange-50 p-5 rounded-xl border border-orange-200">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                    className="mt-1 border-orange-300"
                  />
                  <Label htmlFor="terms" className="text-sm text-orange-800">
                    I accept the{" "}
                    <button className="text-orange-600 hover:underline font-medium">Terms of Service</button> and{" "}
                    <button className="text-orange-600 hover:underline font-medium">Privacy Policy</button>
                  </Label>
                </div>
              </div>
            }
            backContent={
              <div className="space-y-6">

                {/* Guest Access Header */}
                <div className="flex flex-col items-center space-y-5">
                  <p className="text-gray-700 font-medium text-lg">Enter your access key or scan QR</p>
                </div>

                {/* Access Key Input with Icon */}
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="Enter access key"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    className="rounded-xl py-6 pl-6 pr-12 bg-gray-50/90  group-hover:border-orange-300 focus:border-orange-400 focus:ring focus:ring-orange-100 shadow-inner text-lg transition-all duration-200"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 opacity-70 group-hover:opacity-100">
                    <LogIn className="w-6 h-6" />
                  </div>
                </div>

                {/* QR Scanner & Continue Button */}
                <div className="grid grid-cols-2 gap-5 pt-2">
                  {/* QR Scanner Button */}
                  <AlertDialog open={showScanner} onOpenChange={setShowScanner}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-xl py-6 border-gray-300 bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-lg transition-all duration-300 group flex items-center justify-center space-x-2"
                      >
                        <Scan className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">Scan QR</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="min-w-[432px] max-w-screen w-full h-full md:h-fit md:w-fit md:rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold text-center text-orange-600">
                          Scan QR Code
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <QRScanner onResult={handleQRCodeScanned} />
                      <AlertDialogCancel className="rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 mt-4">
                        Cancel
                      </AlertDialogCancel>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Continue Button */}
                  <Button
                    variant={accessKey ? "default" : "outline"}
                    onClick={handleGuestAccess}
                    disabled={!accessKey}
                    className={`rounded-xl py-6 w-full font-medium shadow-md transition-all duration-300 group flex items-center justify-center space-x-2 ${accessKey
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-lg"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    <span>Continue</span>
                    {accessKey && (
                      <span className="ml-2 inline-block transform group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    )}
                  </Button>
                </div>


                {/* Extra Info Section */}
                <div className="pt-3">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100 text-sm text-orange-800 flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Shield className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="ml-3">Guest access is temporary and provides limited features. For full access, please sign in with your account.</p>
                  </div>
                </div>
              </div>
            }
          />
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
