import {client} from "../lib/prisma"
export async function getEmail(shopDomain: string) {
  try {
    const user = await client.user.findUnique({
      where: {
        shopifyDomain: shopDomain,
      },
      select: {
        email: true,
      },
    });

    return user ? user.email : null;
  } catch (error) {
    console.error('Error fetching email for shopDomain:', error);
    return null;
  }
}


export const findUserByEmail = async (email: string) => {
  return await client.user.findUnique({
    where: { email },
  });
};


export const isShopInstalled = async (email: string) => {
  const shopify = await getShop(email)
  const shop = await client.shopify_installed_shop.findUnique({
    where: {
      shop: shopify,
    },
  });

  return shop !== null;
}
export const store_token = async (token: string, shop: string) => {
  const new_installed_shop = await client.shopify_installed_shop.create({
    data: {
      shop: shop,
      accessToken: token,
    }
  });
  console.log("stored_token: ");
  console.log(new_installed_shop);
}
export async function getShop(email: string) {
  console.log(email)
  const existingUser = await client.user.findUnique({
    where: {
      email: email
    }
  });
  console.log(existingUser)
  if (existingUser) {
    return (existingUser.shopifyDomain);
  }
}
export async function getLogoFileName(email: string) {
  console.log(email)
  const existingUser = await client.chatbotCustomization.findUnique({
    where: {
      userEmail: email
    },
    select: {
      logoFilename: true
    }
  });
  console.log(existingUser)
  if (existingUser) {
    return existingUser.logoFilename;
  }
  else {
    return "hell"
  }
}


export const getCustomizationData = async (email: string) => {
  if (email) {
    const customizations = await client.chatbotCustomization.findUnique({
      where: {
        userEmail: email,
      },
    });
    return customizations
  }
}
export const updateAppearance = async (
  email: string,
  selectedColor: string,
  fontFamily: string,
  fontColor: string,
  widgetPosition: string,
  botName: string
) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const updatedCustomization = await client.chatbotCustomization.updateMany({
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
};

export const updateCustomGreetings = async (
  email: string,
  botName: string,
  greetingMessage: string,
) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const updatedCustomization = await client.chatbotCustomization.updateMany({
    where: {
      userEmail: email,
    },
    data: {
      botName,
      greetingMessage,
    },
  });

  return updatedCustomization;
};

export const updateLanguageCustomization = async (
  email: string,
  toneAndStyle: string,
  userGuidance: string,
  positiveReinforcement: string,
  errorHandling: string,
  politeness: string,
  clarityAndSimplicity: string,
  personalization: string,
) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const updatedCustomization = await client.chatbotCustomization.updateMany({
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
};


export const updateBehavioralCustomization = async (
  email: string,
  responseLength: string,
  clarificationPrompt: string,
  apologyAndRetryAttempt: string,
  errorMessageStyle: string,
  greetingMessage: string
) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const updatedCustomization = await client.chatbotCustomization.updateMany({
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
};


export const getChatsData = async (email: string, page: number, limit: number) => {
  const shop = await getShop(email);
  console.log("shop" + shop);

  if (shop) {
    const skip = (page - 1) * limit;

    const conversations = await client.conversation.findMany({
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
};

export const getInstallationData = async (email: string) => {
  const shop = await getShop(email);
  console.log("shop" + shop)
  if (shop) {
    return {
      shop
    }
  }
  else {
    return {
      error: "Shop is not installed yet",
    };
  }
}
export const getTokenwithShop = async (email: string) => {
  const shop = await getShop(email)
  try {
    const shopify = await client.shopify_installed_shop.findUnique({
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
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving shop and token:', error);
    throw error;
  }
}

export const saveFeatureRequest = async (email: string, description: string, details: string, category: string) => {
  try {
    const shop = await getShop(email);
    console.log("Shop: " + shop);

    if (shop) {
      const featureRequest = await client.feature_request.create({
        data: {
          shop,
          description,
          details,
          category,
        },
      });

      console.log("Feature request saved successfully:", featureRequest);
      return featureRequest;
    } else {
      return {
        error: "Shop is not installed yet",
      };
    }
  } catch (error) {
    console.error("Error saving feature request:", error);
    throw error;
  }
};

export const upgradeData = async (email: string) => {
  const shop = await getShop(email)
  try {
    const installedShop = await client.shopify_installed_shop.findUnique({
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
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving shop and access token:', error);
    throw error;
  }
}
export const cancelData = async (email: string) => {
  const shop = await getShop(email)
  try {
    const installedShop = await client.shopify_installed_shop.findUnique({
      where: {
        shop: shop,
      },
      select: {
        shop: true,
        accessToken: true,
      },
    });
    const planDetails = await client.planDetails.findUnique({
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
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving shop and access token:', error);
    throw error;
  }
}

export async function initializePlan(shop: string) {
  const planDetails = await client.planDetails.create({
    data: {
      shopifyDomain: shop,
      planId: 0,
      planStartDate: new Date(),
      convleft: 50
    },
  });
}

export async function getKnowledgeData(email: string) {
  if (email) {
    try {
      const shopDomain = await getShop(email);
      const shopResources = await client.knowledgeBase.findUnique({
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
    } catch (error) {
      console.error('Error fetching shop resources:', error);
      throw error;
    }
  }
}

export async function updatePlanDetails(shopifyDomain: string): Promise<void> {
  try {
    await client.planDetails.update({
      where: {
        shopifyDomain: shopifyDomain,
      },
      data: {
        planId: 0,
        convleft: 50,
      },
    });
    console.log('Plan details updated successfully');
  } catch (error) {
    console.error('Error updating plan details:', error);
    throw error;
  }
}

export async function addFaqUrl(email: string, faqUrl: string) {
  const shopDomain = await getShop(email);
  if (shopDomain) {
    try {
      // Check if the record exists
      const knowledgeBase = await client.knowledgeBase.findUnique({
        where: { shopDomain },
      });

      if (knowledgeBase) {
        // Update the existing record
        await client.knowledgeBase.update({
          where: { shopDomain },
          data: { faqUrl },
        });
      } else {
        // Create a new record if it doesn't exist
        await client.knowledgeBase.create({
          data: {
            shopDomain,
            faqUrl,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export async function deleteFaqUrl(email: string): Promise<void> {
  const shopDomain = await getShop(email);
  try {
    // Check if the record exists
    const knowledgeBase = await client.knowledgeBase.findUnique({
      where: { shopDomain },
    });

    if (knowledgeBase) {
      // Update the existing record by setting faqUrl to null
      await client.knowledgeBase.update({
        where: { shopDomain },
        data: { faqUrl: null },
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function addTermsAndConditionsUrl(email: string, termsAndConditionsUrl: string): Promise<void> {
  const shopDomain = await getShop(email) || "";
  try {
    // Check if the record exists
    const knowledgeBase = await client.knowledgeBase.findUnique({
      where: { shopDomain },
    });

    if (knowledgeBase) {
      // Update the existing record
      await client.knowledgeBase.update({
        where: { shopDomain },
        data: { termsAndConditionsUrl },
      });
    } else {
      // Create a new record if it doesn't exist
      await client.knowledgeBase.create({
        data: {
          shopDomain,
          termsAndConditionsUrl,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function deleteTermsAndConditionsUrl(email: string): Promise<void> {
  const shopDomain = await getShop(email);
  try {
    // Check if the record exists
    const knowledgeBase = await client.knowledgeBase.findUnique({
      where: { shopDomain },
    });

    if (knowledgeBase) {
      // Update the existing record by setting termsAndConditionsUrl to null
      await client.knowledgeBase.update({
        where: { shopDomain },
        data: { termsAndConditionsUrl: null },
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function addHelpUrl(email: string, helpUrl: string): Promise<void> {
  const shopDomain = await getShop(email) || "";
  try {
    // Check if the record exists
    const knowledgeBase = await client.knowledgeBase.findUnique({
      where: { shopDomain },
    });

    if (knowledgeBase) {
      // Update the existing record
      await client.knowledgeBase.update({
        where: { shopDomain },
        data: { helpUrl },
      });
    } else {
      // Create a new record if it doesn't exist
      await client.knowledgeBase.create({
        data: {
          shopDomain,
          helpUrl,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function deleteHelpUrl(email: string): Promise<void> {
  const shopDomain = await getShop(email);
  try {
    // Check if the record exists
    const knowledgeBase = await client.knowledgeBase.findUnique({
      where: { shopDomain },
    });

    if (knowledgeBase) {
      // Update the existing record by setting helpUrl to null
      await client.knowledgeBase.update({
        where: { shopDomain },
        data: { helpUrl: null },
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function updateKbDoc(email: string, fileName: string, file_url: string) {
  const shop = await getShop(email)
  try {

    await client.knowledgeBase.update({
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

  } catch (error) {
    console.error('Database update failed:', error);
    return false
  }
}
interface Document {
  fileUrl: string;
  fileName: string;
}

function getDocuments(document: any, fileName: string) {
  let newDoc = [];
  for (let i = 0; i < document.length; i++) {
    const body = document[i];
    console.log(body.fileName)
    console.log(fileName)
    if (body.fileName === fileName) {
      continue;
    }
    else {
      newDoc.push(body)
    }
  }
  return newDoc
}


export async function deleteKbDoc(email: string, fileName: string) {
  const shop = await getShop(email);

  try {
    const knowledgeBase = await client.knowledgeBase.findUnique({
      where: { shopDomain: shop },
      select: { documents: true }
    });
    if (knowledgeBase && Array.isArray(knowledgeBase.documents)) {
      // Assert that documents are of type Document[]
      const documents = knowledgeBase.documents as unknown as Document[];

      // Filter out the document with the given fileName
      const filteredDocuments = getDocuments(documents, fileName)

      // Update the documents in the knowledge base
      await client.knowledgeBase.update({
        where: { shopDomain: shop },
        data: { documents: filteredDocuments }
      });

      console.log(`Document '${fileName}' has been removed successfully.`);
    } else {
      console.log(`No documents found or shopDomain '${shop}' does not exist.`);
    }
    return true;
  } catch (error) {
    console.error('Database deletion failed:', error);
    return false;
  }
}
export async function addVideoLink(email: string, videoUrl: string): Promise<void> {
  const shop = await getShop(email)
  try {
    // Optionally, check if the videoUrl already exists to avoid duplicates
    const knowledgeBase = await client.knowledgeBase.findUnique({
      where: { shopDomain: shop }
    });

    if (knowledgeBase && !knowledgeBase.videoLinkUrls.includes(videoUrl)) {
      await client.knowledgeBase.update({
        where: { shopDomain: shop },
        data: {
          videoLinkUrls: {
            push: videoUrl
          }
        }
      });
      console.log('Video link added successfully.');
    } else {
      console.log('Video link already exists or shopDomain not found.');
    }
  } catch (error) {
    console.error('Failed to add video link:', error);
    throw new Error('Failed to add video link');
  }
}

