"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVideoLink = exports.deleteKbDoc = exports.updateKbDoc = exports.deleteHelpUrl = exports.addHelpUrl = exports.deleteTermsAndConditionsUrl = exports.addTermsAndConditionsUrl = exports.deleteFaqUrl = exports.addFaqUrl = exports.updatePlanDetails = exports.getKnowledgeData = exports.initializePlan = exports.cancelData = exports.upgradeData = exports.saveFeatureRequest = exports.getTokenwithShop = exports.getInstallationData = exports.getChatsData = exports.updateBehavioralCustomization = exports.updateLanguageCustomization = exports.updateCustomGreetings = exports.updateAppearance = exports.getCustomizationData = exports.getLogoFileName = exports.getShop = exports.store_token = exports.isShopInstalled = exports.findUserByEmail = exports.getEmail = void 0;
const prisma_1 = require("../lib/prisma");
function getEmail(shopDomain) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.client.user.findUnique({
                where: {
                    shopifyDomain: shopDomain,
                },
                select: {
                    email: true,
                },
            });
            return user ? user.email : null;
        }
        catch (error) {
            console.error('Error fetching email for shopDomain:', error);
            return null;
        }
    });
}
exports.getEmail = getEmail;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.client.user.findUnique({
        where: { email },
    });
});
exports.findUserByEmail = findUserByEmail;
const isShopInstalled = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const shopify = yield getShop(email);
    const shop = yield prisma_1.client.shopify_installed_shop.findUnique({
        where: {
            shop: shopify,
        },
    });
    return shop !== null;
});
exports.isShopInstalled = isShopInstalled;
const store_token = (token, shop) => __awaiter(void 0, void 0, void 0, function* () {
    const new_installed_shop = yield prisma_1.client.shopify_installed_shop.create({
        data: {
            shop: shop,
            accessToken: token,
        }
    });
    console.log("stored_token: ");
    console.log(new_installed_shop);
});
exports.store_token = store_token;
function getShop(email) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(email);
        const existingUser = yield prisma_1.client.user.findUnique({
            where: {
                email: email
            }
        });
        console.log(existingUser);
        if (existingUser) {
            return (existingUser.shopifyDomain);
        }
    });
}
exports.getShop = getShop;
function getLogoFileName(email) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(email);
        const existingUser = yield prisma_1.client.chatbotCustomization.findUnique({
            where: {
                userEmail: email
            },
            select: {
                logoFilename: true
            }
        });
        console.log(existingUser);
        if (existingUser) {
            return existingUser.logoFilename;
        }
        else {
            return "hell";
        }
    });
}
exports.getLogoFileName = getLogoFileName;
const getCustomizationData = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (email) {
        const customizations = yield prisma_1.client.chatbotCustomization.findUnique({
            where: {
                userEmail: email,
            },
        });
        return customizations;
    }
});
exports.getCustomizationData = getCustomizationData;
const updateAppearance = (email, selectedColor, fontFamily, fontColor, widgetPosition, botName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new Error("Email is required");
    }
    const updatedCustomization = yield prisma_1.client.chatbotCustomization.updateMany({
        where: {
            userEmail: email,
        },
        data: {
            selectedColor,
            fontFamily,
            fontColor,
            widgetPosition,
            botName
        },
    });
    return updatedCustomization;
});
exports.updateAppearance = updateAppearance;
const updateCustomGreetings = (email, botName, greetingMessage) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new Error("Email is required");
    }
    const updatedCustomization = yield prisma_1.client.chatbotCustomization.updateMany({
        where: {
            userEmail: email,
        },
        data: {
            botName,
            greetingMessage,
        },
    });
    return updatedCustomization;
});
exports.updateCustomGreetings = updateCustomGreetings;
const updateLanguageCustomization = (email, toneAndStyle, userGuidance, positiveReinforcement, errorHandling, politeness, clarityAndSimplicity, personalization) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new Error("Email is required");
    }
    const updatedCustomization = yield prisma_1.client.chatbotCustomization.updateMany({
        where: {
            userEmail: email,
        },
        data: {
            toneAndStyle,
            userGuidance,
            positiveReinforcement,
            errorHandling,
            politeness,
            clarityAndSimplicity,
            personalization,
        },
    });
    return updatedCustomization;
});
exports.updateLanguageCustomization = updateLanguageCustomization;
const updateBehavioralCustomization = (email, responseLength, clarificationPrompt, apologyAndRetryAttempt, errorMessageStyle, greetingMessage) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new Error("Email is required");
    }
    const updatedCustomization = yield prisma_1.client.chatbotCustomization.updateMany({
        where: {
            userEmail: email,
        },
        data: {
            responseLength,
            clarificationPrompt,
            apologyAndRetryAttempt,
            errorMessageStyle,
            greetingMessage
        },
    });
    return updatedCustomization;
});
exports.updateBehavioralCustomization = updateBehavioralCustomization;
const getChatsData = (email, page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield getShop(email);
    console.log("shop" + shop);
    if (shop) {
        const skip = (page - 1) * limit;
        const conversations = yield prisma_1.client.conversation.findMany({
            where: {
                shopDomain: shop,
            },
            skip,
            take: limit,
            orderBy: {
                startedAt: 'desc',
            },
            include: {
                Message: {
                    orderBy: {
                        timestamp: 'asc',
                    },
                },
            },
        });
        return conversations;
    }
    else {
        return {
            error: "Shop is not installed yet",
        };
    }
});
exports.getChatsData = getChatsData;
const getInstallationData = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield getShop(email);
    console.log("shop" + shop);
    if (shop) {
        return {
            shop
        };
    }
    else {
        return {
            error: "Shop is not installed yet",
        };
    }
});
exports.getInstallationData = getInstallationData;
const getTokenwithShop = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield getShop(email);
    try {
        const shopify = yield prisma_1.client.shopify_installed_shop.findUnique({
            where: {
                shop: shop,
            },
            select: {
                shop: true,
                accessToken: true,
            },
        });
        if (shopify) {
            return {
                shop: shopify.shop,
                accessToken: shopify.accessToken,
            };
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.error('Error retrieving shop and token:', error);
        throw error;
    }
});
exports.getTokenwithShop = getTokenwithShop;
const saveFeatureRequest = (email, description, details, category) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shop = yield getShop(email);
        console.log("Shop: " + shop);
        if (shop) {
            const featureRequest = yield prisma_1.client.feature_request.create({
                data: {
                    shop,
                    description,
                    details,
                    category,
                },
            });
            console.log("Feature request saved successfully:", featureRequest);
            return featureRequest;
        }
        else {
            return {
                error: "Shop is not installed yet",
            };
        }
    }
    catch (error) {
        console.error("Error saving feature request:", error);
        throw error;
    }
});
exports.saveFeatureRequest = saveFeatureRequest;
const upgradeData = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield getShop(email);
    try {
        const installedShop = yield prisma_1.client.shopify_installed_shop.findUnique({
            where: {
                shop: shop,
            },
            select: {
                shop: true,
                accessToken: true,
            },
        });
        if (installedShop) {
            return {
                shop: installedShop.shop,
                accessToken: installedShop.accessToken,
            };
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.error('Error retrieving shop and access token:', error);
        throw error;
    }
});
exports.upgradeData = upgradeData;
const cancelData = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield getShop(email);
    try {
        const installedShop = yield prisma_1.client.shopify_installed_shop.findUnique({
            where: {
                shop: shop,
            },
            select: {
                shop: true,
                accessToken: true,
            },
        });
        const planDetails = yield prisma_1.client.planDetails.findUnique({
            where: {
                shopifyDomain: shop,
            },
            select: {
                shopifyid: true,
            },
        });
        if (installedShop && planDetails) {
            return {
                shop: installedShop.shop,
                accessToken: installedShop.accessToken,
                id: planDetails.shopifyid
            };
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.error('Error retrieving shop and access token:', error);
        throw error;
    }
});
exports.cancelData = cancelData;
function initializePlan(shop) {
    return __awaiter(this, void 0, void 0, function* () {
        const planDetails = yield prisma_1.client.planDetails.create({
            data: {
                shopifyDomain: shop,
                planId: 0,
                planStartDate: new Date(),
                convleft: 50
            },
        });
    });
}
exports.initializePlan = initializePlan;
function getKnowledgeData(email) {
    return __awaiter(this, void 0, void 0, function* () {
        if (email) {
            try {
                const shopDomain = yield getShop(email);
                const shopResources = yield prisma_1.client.knowledgeBase.findUnique({
                    where: {
                        shopDomain: shopDomain,
                    },
                });
                if (!shopResources) {
                    console.log(`No resources found for shop domain: ${shopDomain}`);
                    return null;
                }
                return {
                    shopDomain: shopResources.shopDomain,
                    faqUrl: shopResources.faqUrl,
                    termsAndConditionsUrl: shopResources.termsAndConditionsUrl,
                    helpUrl: shopResources.helpUrl,
                    documentFileNames: shopResources.documents,
                    videoLinkUrls: shopResources.videoLinkUrls,
                };
            }
            catch (error) {
                console.error('Error fetching shop resources:', error);
                throw error;
            }
        }
    });
}
exports.getKnowledgeData = getKnowledgeData;
function updatePlanDetails(shopifyDomain) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma_1.client.planDetails.update({
                where: {
                    shopifyDomain: shopifyDomain,
                },
                data: {
                    planId: 0,
                    convleft: 50,
                },
            });
            console.log('Plan details updated successfully');
        }
        catch (error) {
            console.error('Error updating plan details:', error);
            throw error;
        }
    });
}
exports.updatePlanDetails = updatePlanDetails;
function addFaqUrl(email, faqUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const shopDomain = yield getShop(email);
        if (shopDomain) {
            try {
                // Check if the record exists
                const knowledgeBase = yield prisma_1.client.knowledgeBase.findUnique({
                    where: { shopDomain },
                });
                if (knowledgeBase) {
                    // Update the existing record
                    yield prisma_1.client.knowledgeBase.update({
                        where: { shopDomain },
                        data: { faqUrl },
                    });
                }
                else {
                    // Create a new record if it doesn't exist
                    yield prisma_1.client.knowledgeBase.create({
                        data: {
                            shopDomain,
                            faqUrl,
                        },
                    });
                }
            }
            catch (error) {
                console.log(error);
            }
        }
    });
}
exports.addFaqUrl = addFaqUrl;
function deleteFaqUrl(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const shopDomain = yield getShop(email);
        try {
            // Check if the record exists
            const knowledgeBase = yield prisma_1.client.knowledgeBase.findUnique({
                where: { shopDomain },
            });
            if (knowledgeBase) {
                // Update the existing record by setting faqUrl to null
                yield prisma_1.client.knowledgeBase.update({
                    where: { shopDomain },
                    data: { faqUrl: null },
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.deleteFaqUrl = deleteFaqUrl;
function addTermsAndConditionsUrl(email, termsAndConditionsUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const shopDomain = (yield getShop(email)) || "";
        try {
            // Check if the record exists
            const knowledgeBase = yield prisma_1.client.knowledgeBase.findUnique({
                where: { shopDomain },
            });
            if (knowledgeBase) {
                // Update the existing record
                yield prisma_1.client.knowledgeBase.update({
                    where: { shopDomain },
                    data: { termsAndConditionsUrl },
                });
            }
            else {
                // Create a new record if it doesn't exist
                yield prisma_1.client.knowledgeBase.create({
                    data: {
                        shopDomain,
                        termsAndConditionsUrl,
                    },
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.addTermsAndConditionsUrl = addTermsAndConditionsUrl;
function deleteTermsAndConditionsUrl(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const shopDomain = yield getShop(email);
        try {
            // Check if the record exists
            const knowledgeBase = yield prisma_1.client.knowledgeBase.findUnique({
                where: { shopDomain },
            });
            if (knowledgeBase) {
                // Update the existing record by setting termsAndConditionsUrl to null
                yield prisma_1.client.knowledgeBase.update({
                    where: { shopDomain },
                    data: { termsAndConditionsUrl: null },
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.deleteTermsAndConditionsUrl = deleteTermsAndConditionsUrl;
function addHelpUrl(email, helpUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const shopDomain = (yield getShop(email)) || "";
        try {
            // Check if the record exists
            const knowledgeBase = yield prisma_1.client.knowledgeBase.findUnique({
                where: { shopDomain },
            });
            if (knowledgeBase) {
                // Update the existing record
                yield prisma_1.client.knowledgeBase.update({
                    where: { shopDomain },
                    data: { helpUrl },
                });
            }
            else {
                // Create a new record if it doesn't exist
                yield prisma_1.client.knowledgeBase.create({
                    data: {
                        shopDomain,
                        helpUrl,
                    },
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.addHelpUrl = addHelpUrl;
function deleteHelpUrl(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const shopDomain = yield getShop(email);
        try {
            // Check if the record exists
            const knowledgeBase = yield prisma_1.client.knowledgeBase.findUnique({
                where: { shopDomain },
            });
            if (knowledgeBase) {
                // Update the existing record by setting helpUrl to null
                yield prisma_1.client.knowledgeBase.update({
                    where: { shopDomain },
                    data: { helpUrl: null },
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.deleteHelpUrl = deleteHelpUrl;
function updateKbDoc(email, fileName, file_url) {
    return __awaiter(this, void 0, void 0, function* () {
        const shop = yield getShop(email);
        try {
            yield prisma_1.client.knowledgeBase.update({
                where: { shopDomain: shop },
                data: {
                    documents: {
                        push: {
                            fileName: fileName,
                            fileUrl: file_url,
                        },
                    },
                },
            });
            return true;
        }
        catch (error) {
            console.error('Database update failed:', error);
            return false;
        }
    });
}
exports.updateKbDoc = updateKbDoc;
function getDocuments(document, fileName) {
    let newDoc = [];
    for (let i = 0; i < document.length; i++) {
        const body = document[i];
        console.log(body.fileName);
        console.log(fileName);
        if (body.fileName === fileName) {
            continue;
        }
        else {
            newDoc.push(body);
        }
    }
    return newDoc;
}
function deleteKbDoc(email, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const shop = yield getShop(email);
        try {
            const knowledgeBase = yield prisma_1.client.knowledgeBase.findUnique({
                where: { shopDomain: shop },
                select: { documents: true }
            });
            if (knowledgeBase && Array.isArray(knowledgeBase.documents)) {
                // Assert that documents are of type Document[]
                const documents = knowledgeBase.documents;
                // Filter out the document with the given fileName
                const filteredDocuments = getDocuments(documents, fileName);
                // Update the documents in the knowledge base
                yield prisma_1.client.knowledgeBase.update({
                    where: { shopDomain: shop },
                    data: { documents: filteredDocuments }
                });
                console.log(`Document '${fileName}' has been removed successfully.`);
            }
            else {
                console.log(`No documents found or shopDomain '${shop}' does not exist.`);
            }
            return true;
        }
        catch (error) {
            console.error('Database deletion failed:', error);
            return false;
        }
    });
}
exports.deleteKbDoc = deleteKbDoc;
function addVideoLink(email, videoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const shop = yield getShop(email);
        try {
            // Optionally, check if the videoUrl already exists to avoid duplicates
            const knowledgeBase = yield prisma_1.client.knowledgeBase.findUnique({
                where: { shopDomain: shop }
            });
            if (knowledgeBase && !knowledgeBase.videoLinkUrls.includes(videoUrl)) {
                yield prisma_1.client.knowledgeBase.update({
                    where: { shopDomain: shop },
                    data: {
                        videoLinkUrls: {
                            push: videoUrl
                        }
                    }
                });
                console.log('Video link added successfully.');
            }
            else {
                console.log('Video link already exists or shopDomain not found.');
            }
        }
        catch (error) {
            console.error('Failed to add video link:', error);
            throw new Error('Failed to add video link');
        }
    });
}
exports.addVideoLink = addVideoLink;
