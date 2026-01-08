"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Car,
  Utensils,
  Camera,
  Church,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/types";

interface ContactClientProps {
  translations: Dictionary["contact"];
}

const ContactClient = ({ translations: t }: ContactClientProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    guests: "",
    roomPreference: "",
    inquiryType: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    alert(t.form.successMessage);

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      checkIn: undefined,
      checkOut: undefined,
      guests: "",
      roomPreference: "",
      inquiryType: "",
      message: "",
    });

    setIsSubmitting(false);
  };

  const contactMethods = [
    {
      icon: MapPin,
      title: t.directContact.address.title,
      details: t.directContact.address.details,
      action: t.directContact.address.action,
    },
    {
      icon: Phone,
      title: t.directContact.phone.title,
      details: t.directContact.phone.details,
      action: t.directContact.phone.action,
    },
    {
      icon: Mail,
      title: t.directContact.email.title,
      details: t.directContact.email.details,
      action: t.directContact.email.action,
    },
    {
      icon: MessageCircle,
      title: t.directContact.whatsapp.title,
      details: t.directContact.whatsapp.details,
      action: t.directContact.whatsapp.action,
    },
  ];

  const walkingDirections = [
    {
      from: t.location.directions.trainStation.from,
      time: t.location.directions.trainStation.time,
      description: t.location.directions.trainStation.description,
    },
    {
      from: t.location.directions.sanFrancesco.from,
      time: t.location.directions.sanFrancesco.time,
      description: t.location.directions.sanFrancesco.description,
    },
    {
      from: t.location.directions.parking.from,
      time: t.location.directions.parking.time,
      description: t.location.directions.parking.description,
    },
  ];

  const localRecommendations = [
    {
      icon: Utensils,
      category: t.recommendations.restaurants.title,
      items: t.recommendations.restaurants.items,
    },
    {
      icon: Camera,
      category: t.recommendations.hiddenGems.title,
      items: t.recommendations.hiddenGems.items,
    },
    {
      icon: Church,
      category: t.recommendations.spiritualSites.title,
      items: t.recommendations.spiritualSites.items,
    },
  ];

  return (
    <main className="min-h-screen bg-background py-16 pb-24 md:pb-16">
      <div className="container-bnb">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-playfair text-sage mb-4">
            {t.pageTitle}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.pageSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl font-playfair text-sage">
                {t.form.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      {t.form.firstName} {t.form.required}
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      {t.form.lastName} {t.form.required}
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t.form.email} {t.form.required}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.form.phone}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">{t.form.country}</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) =>
                      handleInputChange("country", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.form.selectCountry} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="italy">
                        {t.form.countries.italy}
                      </SelectItem>
                      <SelectItem value="usa">
                        {t.form.countries.usa}
                      </SelectItem>
                      <SelectItem value="uk">{t.form.countries.uk}</SelectItem>
                      <SelectItem value="germany">
                        {t.form.countries.germany}
                      </SelectItem>
                      <SelectItem value="france">
                        {t.form.countries.france}
                      </SelectItem>
                      <SelectItem value="spain">
                        {t.form.countries.spain}
                      </SelectItem>
                      <SelectItem value="other">
                        {t.form.countries.other}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stay Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.form.checkInDate}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.checkIn && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon size={16} className="mr-2" />
                          {formData.checkIn
                            ? format(formData.checkIn, "PPP")
                            : t.form.selectDate}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.checkIn}
                          onSelect={(date) =>
                            handleInputChange("checkIn", date)
                          }
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.form.checkOutDate}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.checkOut && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon size={16} className="mr-2" />
                          {formData.checkOut
                            ? format(formData.checkOut, "PPP")
                            : t.form.selectDate}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.checkOut}
                          onSelect={(date) =>
                            handleInputChange("checkOut", date)
                          }
                          disabled={(date) =>
                            date < new Date() ||
                            !!(formData.checkIn && date <= formData.checkIn)
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guests">{t.form.guests}</Label>
                    <Select
                      value={formData.guests}
                      onValueChange={(value) =>
                        handleInputChange("guests", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.form.selectGuests} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 {t.form.guest}</SelectItem>
                        <SelectItem value="2">2 {t.form.guestPlural}</SelectItem>
                        <SelectItem value="3">3 {t.form.guestPlural}</SelectItem>
                        <SelectItem value="4">4 {t.form.guestPlural}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">{t.form.roomPreference}</Label>
                    <Select
                      value={formData.roomPreference}
                      onValueChange={(value) =>
                        handleInputChange("roomPreference", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.form.selectRoom} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="garden">
                          {t.form.roomOptions.garden}
                        </SelectItem>
                        <SelectItem value="terrace">
                          {t.form.roomOptions.terrace}
                        </SelectItem>
                        <SelectItem value="modern">
                          {t.form.roomOptions.modern}
                        </SelectItem>
                        <SelectItem value="stone">
                          {t.form.roomOptions.stone}
                        </SelectItem>
                        <SelectItem value="any">
                          {t.form.roomOptions.any}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiryType">{t.form.inquiryType}</Label>
                  <Select
                    value={formData.inquiryType}
                    onValueChange={(value) =>
                      handleInputChange("inquiryType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.form.selectInquiry} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">
                        {t.form.inquiryOptions.booking}
                      </SelectItem>
                      <SelectItem value="availability">
                        {t.form.inquiryOptions.availability}
                      </SelectItem>
                      <SelectItem value="group">
                        {t.form.inquiryOptions.group}
                      </SelectItem>
                      <SelectItem value="services">
                        {t.form.inquiryOptions.services}
                      </SelectItem>
                      <SelectItem value="special">
                        {t.form.inquiryOptions.special}
                      </SelectItem>
                      <SelectItem value="other">
                        {t.form.inquiryOptions.other}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    {t.form.message} {t.form.required}
                  </Label>
                  <Textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder={t.form.messagePlaceholder}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-sage hover:bg-sage/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t.form.submitting : t.form.submit}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information & Location */}
          <div className="space-y-8">
            {/* Direct Contact */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl font-playfair text-sage flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  {t.directContact.title}
                </CardTitle>
                <p className="text-muted-foreground">
                  {t.directContact.availability}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-stone-light/30 rounded-lg hover:bg-stone-light/50 transition-colors cursor-pointer"
                  >
                    <method.icon className="w-5 h-5 text-sage mt-1 shrink-0" />
                    <div className="flex-1">
                      <h2 className="font-semibold text-sage">{method.title}</h2>
                      <p className="text-muted-foreground text-sm">
                        {method.details}
                      </p>
                      <span className="text-xs text-sage hover:text-sage/80">
                        {method.action}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Location & Directions */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl font-playfair text-sage flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  {t.location.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-stone-light/30 rounded-lg mb-6 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p>{t.location.mapPlaceholder}</p>
                    <p className="text-sm">{t.location.mapAddress}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="font-semibold text-sage mb-3 flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    {t.location.directions.title}
                  </h2>
                  {walkingDirections.map((direction, index) => (
                    <div key={index} className="border-l-2 border-sage-light pl-4">
                      <p className="font-medium">{direction.from}</p>
                      <p className="text-sage text-sm">{direction.time}</p>
                      <p className="text-muted-foreground text-sm">
                        {direction.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Local Recommendations */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl font-playfair text-sage">
                  {t.recommendations.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {localRecommendations.map((category, index) => (
                  <div key={index}>
                    <h2 className="font-semibold text-sage mb-3 flex items-center gap-2">
                      <category.icon className="w-5 h-5" />
                      {category.category}
                    </h2>
                    <div className="grid grid-cols-1 gap-2">
                      {category.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <div className="w-1.5 h-1.5 bg-sage rounded-full shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactClient;
