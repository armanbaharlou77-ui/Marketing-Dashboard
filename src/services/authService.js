import axios from "axios";
import Cookies from "js-cookie";

const httpClient = axios.create({
  // baseURL: "http://192.168.100.208/saha03/demo/kasb_api",
  // baseURL: "https://oh2.ir/k_api",
  baseURL: "https://manoshahrplus.ir/k_api",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
});

const uploadClient = axios.create({
  // baseURL: "http://192.168.100.208/saha03/demo/kasb_api",
  // baseURL: "https://oh2.ir/k_api",
  baseURL: "https://manoshahrplus.ir/k_api",
  method: "POST",
});

export const sendCode = async (phone, type) => {
  const response = await httpClient({
    data: {
      token: "",
      class_name: "login",
      function_name: "send_cod",
      mobile: phone,
      type,
    },
  });

  return response.data;
};

export const start = async (phone, code, type) => {
  const response = await httpClient({
    data: {
      token: "",
      class_name: "login",
      function_name: "start",
      mobile: phone,
      code: code,
      type: type,
    },
  });

  return response.data;
};

export const setInfo = async (firstName, lastName, token) => {
  const response = await httpClient({
    data: {
      token,
      class_name: "users",
      function_name: "set_info",
      first_name: firstName,
      last_name: lastName,
    },
  });

  return response.data;
};

export const setBusiness = async (payload = {}) => {
  const {
    businessId = 0,
    ownerId,
    businessTitle,
    shortDescription,
    address,
    city,
    about,
    category_ids,
    imgs,
    links,
    socials,
    phones,
    specs,
    lat,
    lng,
    banner = "",
  } = payload;

  const userInfo = localStorage.getItem("dashboard-user");
  const storedOwnerId = userInfo ? JSON.parse(userInfo)?.owner_id : null;
  const token = Cookies.get("owner-token");

  const response = await httpClient({
    data: {
      token,
      class_name: "business_business",
      function_name: "set_business",
      id: businessId,
      owner_id: ownerId ?? storedOwnerId,
      name: businessTitle,
      description: shortDescription,
      address,
      city,
      about,
      category_ids: category_ids || [],
      imgs: imgs || [],
      links: links || [],
      socials: socials || [],
      phones: phones || [],
      specs: specs || [],
      lat,
      lng,
      banner,
    },
  });

  return response.data;
};

export const addFile = async (file, token) => {
  const formData = new FormData();
  formData.append("token", token);
  formData.append("class_name", "media");
  formData.append("function_name", "add_file");
  formData.append("file", file);

  const response = await uploadClient({
    data: formData,
  });

  return response.data;
};

export const getBusiness = async (id) => {
  const token = Cookies.get("owner-token");
  const response = await httpClient({
    data: {
      token,
      class_name: "business_business",
      function_name: "get_businesses",
      owner_id: id,
    },
  });

  return response.data;
};
export const getFeed = async (id) => {
  const token = Cookies.get("owner-token");
  const activeBusiness = localStorage.getItem("dashboard-activeBusiness");
  const businessId = id ?? (activeBusiness ? JSON.parse(activeBusiness).id : 0);
  const response = await httpClient({
    data: {
      token,
      class_name: "post",
      function_name: "get_feed",
      page_number: 1,
      per_page: 0, // 0 means all posts
      search: "",
      sort: 0, // sorts based on updated time 0 = descending order 1 = ascending
      only_active: 0,
      business_id: businessId, // 0 means all businesses
    },
  });

  return response.data;
};
export const setPost = async (formData, productId = 0) => {
  const token = Cookies.get("owner-token");
  const activeBusiness = localStorage.getItem("dashboard-activeBusiness");

  const response = await httpClient({
    data: {
      token,
      class_name: "post",
      function_name: "set_post",
      id: productId,
      business_id: activeBusiness ? JSON.parse(activeBusiness).id : 0,
      name: formData?.title,
      description: formData?.description,
      image: formData?.image,
      price: formData?.price,
      discount: formData?.discount,
      total_price: "",
      status: 1,
    },
  });

  return response.data;
};

export const getOwner = async (ownerId) => {
  const token = Cookies.get("owner-token");

  const response = await httpClient({
    data: {
      token: token,
      class_name: "users",
      function_name: "get_owners",
      page_number: 1,
      per_page: 50, // 0 means all owners
      search: "",
      sort: 0, // sorts based on user id 0 = descending order 1 = ascending
      owner_id: ownerId, // 0 means all owners
      user_id: 0, // 0 means all users
      verified: "", // empty means all owners; 0 = unverified, 1 = verified
      active: "", // empty means all users; 0 = inactive, 1 = active
    },
  });

  return response.data;
};

export const getCities = async () => {
  const token = Cookies.get("owner-token");

  const response = await httpClient({
    data: {
      token: "",
      class_name: "city_city",
      function_name: "get_cities",
    },
  });

  return response.data;
};

export const setCategory = async (payload) => {
  const token = Cookies.get("owner-token");

  const response = await httpClient({
    data: {
      token,
      class_name: "category",
      function_name: "set_category",
      id: payload.id ?? 0,
      name: payload.name,
      image_url: payload.image_url ?? "",
      parent_id: payload.parent_id ?? 0,
      status: payload.status ?? 1,
    },
  });

  return response.data;
};

export const getCategories = async (parentId = 0) => {
  const token = Cookies.get("owner-token");

  const response = await httpClient({
    data: {
      token,
      class_name: "category",
      function_name: "get_categories",
      page_number: 1,
      per_page: 50,
      search: "",
      parent_id: parentId, // empty means all   0 means top-level-categories
      status: "",
    },
  });

  return response.data;
};

export const getCategoryGraph = async () => {
  const token = Cookies.get("owner-token");

  const response = await httpClient({
    data: {
      token,
      class_name: "category",
      function_name: "get_category_graph",
    },
  });

  return response.data;
};
