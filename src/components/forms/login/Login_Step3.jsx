'use client'

import React, { useCallback, useState } from 'react'
import BaseInfo from "@/components/marketing/BaseInfo";
import ContactInfo from "@/components/marketing/ContactInfo";
import PhotoGallery from "@/components/marketing/PhotoGallery";
import Specifications from "@/components/marketing/Specifications";
import Category from "@/components/marketing/Category";
import { useRouter } from 'next/navigation';
import { getBusiness, setBaseInfoApi } from '@/services/authService';
import { useActiveBusiness } from '@/components/providers/ActiveBusinessProvider';
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export default function Login_Step3() {
    const { setActiveBusiness, setApiBusinesses } = useActiveBusiness();

    const [businessTitle, setBusinessTitle] = useState('')
    const [englishName, setEnglishName] = useState('')
    const [shortDescription, setShortDescription] = useState('')
    const [about, setAbout] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [position, setPosition] = useState(null);
    const [galleryItems, setGalleryItems] = useState([
        { id: 1, image: '', imagePreview: '', uploadedUrl: '', title: '', alt: '' },
    ])
    const [selectedCategories, setSelectedCategories] = useState([])
    const [bannerItem, setBannerItem] = useState(null)
    const [contactData, setContactData] = useState({
        phones: [],
        links: [],
        socials: [],
    })
    const [specificationsData, setSpecificationsData] = useState([])
    const [errors, setErrors] = useState({})

    const router = useRouter()



    const handleInfoChange = useCallback((info = {}) => {
        if (info.businessTitle !== undefined) setBusinessTitle(info.businessTitle)
        if (info.englishName !== undefined) setEnglishName(info.englishName)
        if (info.shortDescription !== undefined) setShortDescription(info.shortDescription)
        if (info.about !== undefined) setAbout(info.about)
        if (info.address !== undefined) setAddress(info.address)
        if (info.city !== undefined) setCity(info.city)
    }, [])

    // const handleGalleryChange = useCallback((items = []) => {
    //     setGalleryItems(items)
    // }, [])

    // const handleBannerChange = useCallback((item) => {
    //     setBannerItem(item)
    // }, [])

    // const handleContactChange = useCallback((nextContactData = {}) => {
    //     setContactData({
    //         phones: nextContactData.phones || [],
    //         links: nextContactData.links || [],
    //         socials: nextContactData.socials || [],
    //     })
    // }, [])

    // const handleSpecificationsChange = useCallback((nextSpecifications = []) => {
    //     setSpecificationsData(nextSpecifications || [])
    // }, [])

    const fieldScrollMap = {
        businessTitle: 'businessTitle',
        shortDescription: 'shortDescription',
        about: 'about',
        address: 'address',
        gallery: 'photoGallerySection',
    }

    const scrollToErrorField = (field) => {
        const elementId = fieldScrollMap[field]
        if (!elementId) return

        const element = document.getElementById(elementId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            if (typeof element.focus === 'function') {
                element.focus()
            }
        }
    }

    const handleSubmit = async () => {
        const nextErrors = {}

        if (!businessTitle.trim()) nextErrors.businessTitle = 'عنوان کسب و کار الزامی است.'
        if (!shortDescription.trim()) nextErrors.shortDescription = 'توضیح کوتاه الزامی است.'
        if (!englishName.trim()) nextErrors.englishName = 'نام انگلیسی الزامی است.'
        if (!about.trim()) nextErrors.about = 'درباره کسب و کار الزامی است.'
        if (!address.trim()) nextErrors.address = 'آدرس الزامی است.'

        // const hasImage = galleryItems.some(
        //     (item) => item.image || item.imagePreview
        // )
        // if (!hasImage) nextErrors.gallery = 'حداقل یک عکس باید انتخاب شود.'

        setErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) {
            const firstErrorField = Object.keys(nextErrors)[0]
            setTimeout(() => scrollToErrorField(firstErrorField), 100)
            return
        }

        // const uploadedImgs = galleryItems
        //     .filter((item) => item.uploadedUrl)
        //     .map((item) => ({
        //         url: item.uploadedUrl,
        //         title: item.title || "",
        //         alt: item.alt || "",
        //     }))

        // if (uploadedImgs.length === 0) {
        //     nextErrors.gallery = 'حداقل یک عکس با لینک آپلود شده باید وجود داشته باشد.'
        //     setErrors(nextErrors)
        //     setTimeout(() => scrollToErrorField('gallery'), 100)
        //     return
        // }

        // const pendingUpload = galleryItems.some(
        //     (item) => item.image && !item.uploadedUrl && item.uploading
        // )
        // if (pendingUpload) {
        //     nextErrors.gallery = 'لطفا صبر کنید تا آپلود عکس‌ها کامل شود.'
        //     setErrors(nextErrors)
        //     setTimeout(() => scrollToErrorField('gallery'), 100)
        //     return
        // }

        const phones = contactData.phones || []
        const links = contactData.links || []
        const socials = Array.isArray(contactData.socials)
            ? contactData.socials
            : Object.entries(contactData.socials || {}).map(([key, val]) => ({
                id: key,
                value: val,
            }))
        const specs = specificationsData || []

        const bannerUrl = bannerItem?.uploadedUrl || ""

        try {
            const payload = {
                businessId: 0,
                businessTitle,
                englishName,
                shortDescription,
                address,
                city,
                about,
                lat: position ? position.lat : null,
                lng: position ? position.lng : null,
                // imgs: uploadedImgs,
                // links,
                // socials,
                // phones,
                // specs,
                // banner: bannerUrl,
                // category_ids: selectedCategories || []
            }

            const data = await setBaseInfoApi(payload)
            if (data.msg === 0) {
                const extractBusinessFromResponse = (response) => {
                    const candidate =
                        response?.business ||
                        response?.value ||
                        response?.data ||
                        response?.result ||
                        response?.item;
                    return candidate && typeof candidate === "object" && !Array.isArray(candidate)
                        ? candidate
                        : null;
                };

                const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

                try {
                    const storedUser = JSON.parse(
                        localStorage.getItem("dashboard-user") || "null",
                    );
                    const ownerId = storedUser?.owner_id;

                    const previousBusinesses = Array.isArray(storedUser?.businesses)
                        ? storedUser.businesses
                        : storedUser?.business
                            ? [storedUser.business]
                            : [];

                    const previousIds = new Set(
                        previousBusinesses
                            .map((business) => business?.id)
                            .filter((id) => id != null)
                            .map(String),
                    );

                    if (!ownerId) {
                        toast.success(data.msg_txt || "اطلاعات با موفقیت ثبت شد")
                        router.push('/')
                        return;
                    }

                    // 1) اول اگر سرور خود آبجکت business برگرداند، همان را استفاده می‌کنیم.
                    let createdBusiness = extractBusinessFromResponse(data);

                    // 2) اگر هنوز business جدید از API در لیست نیامده (تاخیر سرور)، چند بار با فاصله دوباره می‌گیریم.
                    let businesses = [];
                    if (!createdBusiness?.id) {
                        const attempts = 4;
                        for (let attempt = 0; attempt < attempts; attempt++) {
                            const businessResponse = await getBusiness(ownerId);
                            businesses = Array.isArray(businessResponse?.businesses)
                                ? businessResponse.businesses
                                : [];

                            createdBusiness =
                                businesses.find(
                                    (business) =>
                                        business?.id != null &&
                                        !previousIds.has(String(business.id)),
                                ) ||
                                businesses.find(
                                    (business) =>
                                        business?.name === businessTitle &&
                                        business?.address === address,
                                ) ||
                                null;

                            if (createdBusiness?.id) break;
                            await sleep(900 + attempt * 500);
                        }
                    } else {
                        // اگر از response اومده، فعلا لیست را برای selector هم می‌گیریم.
                        const businessResponse = await getBusiness(ownerId);
                        businesses = Array.isArray(businessResponse?.businesses)
                            ? businessResponse.businesses
                            : [];
                    }

                    // اگر پیدا نشد، حداقل آخرین مورد لیست را fallback می‌گیریم.
                    if (!createdBusiness?.id && Array.isArray(businesses) && businesses.length > 0) {
                        createdBusiness = businesses[businesses.length - 1];
                    }

                    if (createdBusiness?.id) {
                        // برای جلوگیری از race، نهایی‌ترین لیست را یک بار می‌گیریم.
                        const businessResponse = await getBusiness(ownerId);
                        businesses = Array.isArray(businessResponse?.businesses)
                            ? businessResponse.businesses
                            : [];

                        const ownerProfile = {
                            first_name:
                                businessResponse?.owner_first_name ||
                                createdBusiness?.owner_first_name ||
                                storedUser?.first_name ||
                                "",
                            last_name:
                                businessResponse?.owner_last_name ||
                                createdBusiness?.owner_last_name ||
                                storedUser?.last_name ||
                                "",
                        };

                        const nextUser = {
                            ...storedUser,
                            ...ownerProfile,
                            businesses,
                            business: createdBusiness,
                        };

                        localStorage.setItem(
                            "dashboard-user",
                            JSON.stringify(nextUser),
                        );

                        if (typeof setApiBusinesses === "function") {
                            setApiBusinesses(businesses);
                        }

                        setActiveBusiness(createdBusiness);
                    }
                } catch (syncError) {
                    console.error(syncError);
                }

                toast.success(data.msg_txt || "اطلاعات با موفقیت ثبت شد")
                router.push('/')
            } else {
                toast.error(data.msg_txt || "خطا در ثبت اطلاعات")
            }
        } catch (err) {
            console.error(err)
            alert('خطا در ارسال اطلاعات')
        }
    }





    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">


            <div className="mb-8 mt-2 flex justify-center w-full">
                <h1 className="bg-slate-600 w-full sm:w-fit text-center py-3 sm:py-4 px-6 sm:px-10 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-extrabold text-gray-100 shadow-sm">
                    ثبت نام کسب و کار
                </h1>
            </div>


            <div className="space-y-8 sm:space-y-12">
                <BaseInfo
                    businessTitle={businessTitle}
                    englishName={englishName}
                    shortDescription={shortDescription}
                    about={about}
                    address={address}
                    city={city}
                    errors={errors}
                    position={position}
                    setPosition={setPosition}
                    onInfoChange={handleInfoChange}
                />
                {/* <Category
                    setCategories={setSelectedCategories}
                    initialCategoryIds={[]}
                />
                <PhotoGallery
                    galleryItems={galleryItems}
                    onGalleryChange={handleGalleryChange}
                    bannerItem={bannerItem}
                    onBannerChange={handleBannerChange}
                    error={errors.gallery}
                />
                <Specifications onSpecificationsChange={handleSpecificationsChange} />
                <ContactInfo onContactChange={handleContactChange} /> */}
            </div>

            <div className="mt-10 mb-20 sm:mb-10 flex items-center justify-center sm:justify-end">
                <button
                    onClick={handleSubmit}
                    className="w-full sm:w-auto bg-indigo-600 shadow-lg shadow-indigo-500/30 text-gray-100 py-3.5 sm:py-3 px-12 rounded-xl sm:rounded-lg font-bold hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                    ثبت نهایی
                </button>
            </div>

        </div>
    )
}

