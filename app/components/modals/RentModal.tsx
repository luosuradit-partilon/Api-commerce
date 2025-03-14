'use client'

import useRentModal from "@/app/hooks/useRentModal";
import Modal from "./Modal";
import { useMemo, useState } from "react";
import Heading from "../Heading";
import { categories } from "../navbar/Categories";
import CategoryInput from "../inputs/CategoryInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import CountrySelect from "../inputs/CountrySelect";
import dynamic from "next/dynamic";
import Counter from "../inputs/Counter";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "../Button";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import { AiOutlineMinus } from "@react-icons/all-files/ai/AiOutlineMinus";


enum STEPS {
    CATEGORY = 0,
    LOCATION = 1,
    INFO = 2,
    IMAGES = 3,
    DESCRIPTION = 4,
    PRICE = 5,
    RESOURCES = 6, // New step added
}

const httpmethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]; // List of HTTP methods

const RentModal = () => {
    const router = useRouter();
    const rentModal = useRentModal();

    const [step, setStep] = useState(STEPS.CATEGORY)
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        },
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            category: '',
            location: null,
            guestCount: 1,
            roomCount: 1,
            bathroomCount: 1,
            imageSrc: [],
            price: 1,
            title: '',
            description: '',
            resources: [{ resourceName: '', methods: [{ type: '', description: '' }] }] // Default values for resources
        }
    });

    const category = watch('category');
    const location = watch('location');
    const guestCount = watch('guestCount');
    const roomCount = watch('roomCount');
    const bathroomCount = watch('bathroomCount');
    const imageSrc = watch('imageSrc');
    const resources = watch('resources');

    const Map = useMemo(() => dynamic(() => import('../Map'), {
        ssr: false
    }), [location]);

    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        })
    }

    const onBack = () => {
        setStep((value) => value - 1);
    }

    const onNext = () => {
        setStep((value) => value + 1);
    }

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        console.log(data);
        if (step !== STEPS.RESOURCES) { // Change the final step to RESOURCES
            return onNext();
        }
        setIsLoading(true);

        try {
            const listingResponse = await axios.post('/api/listings', data);
            const listingId = listingResponse.data.id;

            const resourcePromises = data.resources.map((resource: any) => {
                return axios.post('/api/resources', {
                    resourceName: resource.resourceName,
                    listingId: listingId,
                }).then((resourceResponse) => {
                    const resourceId = resourceResponse.data.id;
                    const methodPromises = resource.methods.map((method: any) => {
                        return axios.post('/api/methods', {
                            type: method.type,
                            description: method.description,
                            resourceId: resourceId,
                        });
                    });
                    return Promise.all(methodPromises);
                });
            });

            await Promise.all(resourcePromises);

            toast.success('Listing Created!');
            router.refresh();
            reset();
            setStep(STEPS.CATEGORY);
            rentModal.onClose();
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    const addResource = () => {
        const updatedResources = [...resources, { resourceName: '', methods: [{ type: '', description: '' }] }];
        setCustomValue('resources', updatedResources);
    }

    const deleteResource = (index: number) => {
        const updatedResources = resources.filter((_: any, i: number) => i !== index);
        setCustomValue('resources', updatedResources);
    }

    const actionLabel = useMemo(() => {
        if(step === STEPS.RESOURCES) {
            return 'Create';
        }
        return 'NEXT';
    }, [step]);

    const secondaryActionLabel = useMemo(() => {
        if(step === STEPS.CATEGORY) {
            return undefined
        }

        return 'Back';
    }, [step]);

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading 
                title="Which of these best describes your place?"
                subtitle="Pick a category"
            />
            <div
                className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-3
                max-h-[50vh]
                overflow-y-auto
                "
            >
                {categories.map((item) => (
                    <div key={item.label} className="col-span-1">
                        <CategoryInput
                            onClick={(category) => 
                                setCustomValue('category', category)}
                            selected={category === item.label}
                            label={item.label}
                            icon={item.icon}
                        />
                    </div>
                ))}
            </div>
        </div>
    )

    if(step === STEPS.LOCATION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="Where is your place located?"
                    subtitle="Help guests find you!"
                />
                <CountrySelect 
                    value={location}
                    onChange={(value) => setCustomValue('location', value)}
                />
                <Map 
                    center={location?.latlng}
                />
            </div>
        )
    }

    if(step === STEPS.INFO) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title='Share some basic about your place'
                    subtitle="What amenities do you have?"    
                />
                <Counter 
                    title="Guests"
                    subTitle="How many guests do you allow?"
                    value={guestCount}
                    onChange={(value) => setCustomValue('guestCount', value)}
                />
                <hr />
                <Counter 
                    title="Rooms"
                    subTitle="How many rooms do you have?"
                    value={roomCount}
                    onChange={(value) => setCustomValue('roomCount', value)}
                />
                <hr />
                <Counter 
                    title="Bathrooms"
                    subTitle="How many bathrooms do you have?"
                    value={bathroomCount}
                    onChange={(value) => setCustomValue('bathroomCount', value)}
                />
            </div>
        )
    }

    if (step === STEPS.IMAGES) {
        console.log("imageSrc:", imageSrc);
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="Add photos of your place"
                    subtitle="Show guests what your place looks like!"
                />
                <ImageUpload 
                    value={imageSrc} // Pass the array of image URLs
                    onChange={(value) => setCustomValue('imageSrc', value)}
                />
                {imageSrc?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[25vh] overflow-y-auto">
                        {imageSrc.map((src: string, index: number) => (
                            <div key={index} className="relative h-40">
                                <Image
                                    alt={`Uploaded image ${index + 1}`} 
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    src={src}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (step === STEPS.DESCRIPTION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="How would you describe your place?"
                    subtitle="Short and sweet works best!" 
                />
                <Input 
                    id="title"
                    label="Title"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <hr />
                <Input 
                    id="description"
                    label="Description"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }

    if (step === STEPS.PRICE) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Now, set your price"
                    subtitle="How much do you charge per night?"
                />
                <Input
                    id="price"
                    label="Price"
                    formatPrice
                    type="number"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }

    if (step === STEPS.RESOURCES) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-2">
                        <Heading
                            title="Add resource for your API"
                            subtitle="Specify resource names and methods"
                        />
                    </div>
                    <div
                        onClick={addResource}
                        className="w-12 h-12 rounded-full border-[1px] bg-rose-500 border-rose-500 flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition"
                    >
                        <AiOutlinePlus />
                    </div>
                </div>
                <div className="max-h-[50vh] overflow-y-auto">
                    {resources.map((resource: any, index: number) => (
                        <div key={index} className="flex flex-col">
                            <hr className="m-5"/>
                            <Heading
                            title="New Resource"
                            />
                            <div className="flex justify-between items-center">
                                <div className="max-w-[500px] w-full">
                                <Input
                                    id={`resources[${index}].resourceName`}
                                    label="Resource Name (/example)"
                                    disabled={isLoading}
                                    register={register}
                                    errors={errors}
                                    required
                                />
                                </div>
                                <div
                                    onClick={() => deleteResource(index)}
                                    className="w-10 h-10 rounded-full border-[1px] border-neutral-400 flex items-center justify-center text-neutral-600 cursor-pointer hover:opacity-80 transition"
                                >
                                <AiOutlineMinus />
                                </div>
                            </div>
                            <div className="max-w-[150px] my-5">
                                <Button
                                    label="Add method"
                                    onClick={() => {
                                        const updatedResources = [...resources];
                                        updatedResources[index].methods.push({ type: '', description: '' });
                                        setCustomValue('resources', updatedResources);
                                    }}
                                />
                            </div>
                            {resources[index].methods.map((methods: any, methodsIndex: number) => (
                                <div key={methodsIndex} className="flex flex-col gap-2">                               
                                    <label htmlFor={`resources[${index}].methods[${methodsIndex}].type`} className="block text-sm font-medium text-gray-700">
                                        methods Type
                                    </label>
                                    <select
                                        id={`resources[${index}].methods[${methodsIndex}].type`}
                                        {...register(`resources[${index}].methods[${methodsIndex}].type`, { required: true })}
                                        disabled={isLoading}
                                        className="mt-1 block max-w-[150px] w-full pl-3 pr-10 py-2 text-base border-[1px] border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        {httpmethods.map((methods) => (
                                            <option key={methods} value={methods}>
                                                {methods}
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        id={`resources[${index}].methods[${methodsIndex}].description`}
                                        label="Description"
                                        disabled={isLoading}
                                        register={register}
                                        errors={errors}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    
    return (
        <Modal 
            title="Publish your API!"
            isOpen={rentModal.isOpen}
            onClose={rentModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
            body={bodyContent}
        />
    )
}

export default RentModal;
