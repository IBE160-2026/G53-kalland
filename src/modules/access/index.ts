// Public API of the access module (AD-3, AD-6): the only authority on what a client may see and download. Owns no tables.
export { getClientImage, listClientImages, type ClientImage, type ClientPrice } from "./client-images";
export { clientMaySeeLocation, type AccessFlags } from "./visibility";
