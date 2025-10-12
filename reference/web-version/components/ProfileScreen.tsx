import { useState } from "react";
import { Edit2, User, Phone, Mail, MapPin, Calendar, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Raj Kumar",
    phone: "+91 98765 43210",
    email: "raj.kumar@email.com",
    birthPlace: "Mumbai, Maharashtra",
    birthDate: "1990-05-15",
    birthTime: "14:30",
    language: "Hindi"
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save profile logic here
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl">My Profile</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-xl"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Profile Photo */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <ImageWithFallback
                src="https://images.unsplash.com/400x400/?indian man portrait"
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              {isEditing && (
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary hover:bg-primary/90"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            <h2 className="mb-2">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">Member since 2023</p>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Full Name</Label>
              {isEditing ? (
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="mt-1 h-12 rounded-xl border-0 bg-input-background"
                />
              ) : (
                <p className="mt-1">{profile.name}</p>
              )}
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Phone Number</Label>
              {isEditing ? (
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="mt-1 h-12 rounded-xl border-0 bg-input-background"
                />
              ) : (
                <p className="mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {profile.phone}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Email Address</Label>
              <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {profile.email}
                <span className="text-xs bg-muted px-2 py-1 rounded-full">Not Editable</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Birth Details */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Birth Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Date of Birth</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => setProfile({...profile, birthDate: e.target.value})}
                  className="mt-1 h-12 rounded-xl border-0 bg-input-background"
                />
              ) : (
                <p className="mt-1">{new Date(profile.birthDate).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}</p>
              )}
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Time of Birth</Label>
              {isEditing ? (
                <Input
                  type="time"
                  value={profile.birthTime}
                  onChange={(e) => setProfile({...profile, birthTime: e.target.value})}
                  className="mt-1 h-12 rounded-xl border-0 bg-input-background"
                />
              ) : (
                <p className="mt-1">{profile.birthTime}</p>
              )}
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Place of Birth</Label>
              {isEditing ? (
                <Input
                  value={profile.birthPlace}
                  onChange={(e) => setProfile({...profile, birthPlace: e.target.value})}
                  className="mt-1 h-12 rounded-xl border-0 bg-input-background"
                  placeholder="City, State"
                />
              ) : (
                <p className="mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {profile.birthPlace}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Preferred Language</Label>
              {isEditing ? (
                <Input
                  value={profile.language}
                  onChange={(e) => setProfile({...profile, language: e.target.value})}
                  className="mt-1 h-12 rounded-xl border-0 bg-input-background"
                />
              ) : (
                <p className="mt-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  {profile.language}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Button 
            onClick={handleSave}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90"
          >
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}