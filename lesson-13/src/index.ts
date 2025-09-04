function greet(name: string, greeting?: string): string {
    if (greeting) {
        return `${greeting}, ${name}!`;
    }
    return `Hello, ${name}!`;
}

console.log(greet("Alice"));
console.log(greet("Bob", "Good morning"));
console.log(greet("Charlie", "Hi"));

interface User {
    name: string;
    age: number;
    email: string;
}

function createUser(
    name: string,
    age?: number,
    email?: string
): User {
    return {
        name,
        age: age ?? 0,
        email: email ?? "unknown@example.com"
    };
}

console.log(createUser("Alice"));
console.log(createUser("Bob", 25));
console.log(createUser("Charlie", 30, "charlie@example.com"));

function buildUrl(
    protocol: string,
    domain: string,
    path?: string,
    port?: number
): string {
    let url = `${protocol}://${domain}`;
    if (port) {
        url += `:${port}`;
    }
    if (path) {
        url += `/${path}`;
    }
    return url;
}

console.log(buildUrl("https", "example.com"));
console.log(buildUrl("https", "example.com", "api/users"));
console.log(buildUrl("http", "localhost", undefined, 3000));
console.log(buildUrl("https", "api.example.com", "v1/products", 443));

function optionalParam(value?: string): void {
    console.log(`Optional: ${value ?? "not provided"}`);
}

function undefinedParam(value: string | undefined): void {
    console.log(`Undefined: ${value ?? "not provided"}`);
}

optionalParam();
optionalParam("test");
optionalParam(undefined);

undefinedParam(undefined);
undefinedParam("test");

function formatDate(date: Date, format?: string, locale?: string): string {
    const fmt = format ?? "YYYY-MM-DD";
    const loc = locale ?? "en-US";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    if (fmt === "YYYY-MM-DD") {
        return `${year}-${month}-${day}`;
    } else if (fmt === "DD/MM/YYYY") {
        return `${day}/${month}/${year}`;
    } else {
        return `${month}/${day}/${year}`;
    }
}

const today = new Date();
console.log(formatDate(today));
console.log(formatDate(today, "DD/MM/YYYY"));
console.log(formatDate(today, "MM/DD/YYYY", "en-US"));

function calculatePrice(
    basePrice: number,
    taxRate?: number,
    discount?: number
): number {
    const tax = taxRate ?? 0.1;
    const disc = discount ?? 0;
    
    const priceWithTax = basePrice * (1 + tax);
    const finalPrice = priceWithTax * (1 - disc);
    
    return Math.round(finalPrice * 100) / 100;
}

console.log("Price: $", calculatePrice(100));
console.log("Price with 8% tax: $", calculatePrice(100, 0.08));
console.log("Price with tax and 10% discount: $", calculatePrice(100, 0.08, 0.1));

export { 
    greet, 
    createUser, 
    buildUrl, 
    optionalParam, 
    undefinedParam, 
    formatDate, 
    calculatePrice,
    User 
};