function simplifyURL(base,url) {
    let array = url.split('/');
    return base+array[array.length-1];
}
export { simplifyURL }
