// Comment out if not testing

const autoTest = (toggleOutputs) => {
    const left = document.getElementById("left-input");

    // left.value = [
    // `export type JaneInvoice = Record<string, any> & {`,
    // `    invoice_number: string;  // "DocNumber" => "12345",`,
    // `    invoice_date: string; // "TxnDate" => "2022-01-03",`,
    // `    jane_pt_id: number;`,
    // `    practitioner: string;`,
    // `    income_category: string;`,
    // `    jane_item_name: string;`,
    // `    notes: any;`,
    // `    status: JaneStatus;    `,
    // `    jane_billing_lines: JaneInvoiceBillingLine[];`,
    // `    amt_unit_cost: number; `,
    // `    amt_unit_price: number; // "UnitPrice" => 100.0,`,
    // `    amt_subtotal: number;`,
    // `    amt_tax: number;`,
    // `    tax_code: JaneTaxCode;`,
    // `    // amt_hst: number; // 'TotalTax' => 0.0,`,
    // `    // amt_gst: number; // 'TotalTax' => 0.0,`,
    // `    amt_total: number;  // "Amount" => 100.0,`,
    // `    amt_collected: number;`,
    // `    amt_balance: number;`,
    // `    last_qb_update?: string;`,
    // `}`,
    // ].join("\n");

    left.value = [
        `export type JaneInvoiceBillingLine = Record<string, any> & {`,
        `    service_date: string; // csvrow.purchase_date`,
        `    billing_number: string; // "Description" => "12345-P01",`,
        `    billing_type: string;`,
        ``,
        `    qty: number;  // "Qty" => 1`,
        `    amt_tax: number;`,
        `    amt_subtotal: number;`,
        `    amt_collected: number;`,
        `    amt_balance: number;`,
        `    amt_total: number;`,
        `    `,
        `    payment_method: string; // "PaymentMethodRef" => [ "value" => "3" ],`,
        `    qbo_tax_code_ref?: number; // "TaxCodeRef" => [ "value" => 3 ],`,
        `    qbo_item_id?: number; // "ItemRef" => [ "value" => 1334 ],`,
        `    trans_class?: string;// "ClassRef" => [ "value" => "3500000000001079952" ],`,
        `}`,
        ].join("\n");
    const right = document.getElementById("right-input");
    // right.value = [
    //     `protected $casts = [`,
    //     `    'invoice_number' => 'string',`,
    //     `    'invoice_date' => 'string',`,
    //     `    'jane_pt_id' => 'string',`,
    //     `    'practitioner' => 'string',`,
    //     `    'income_category' => 'string',`,
    //     `    'jane_item_name' => 'string',`,
    //     `    'notes' => 'array',`,
    //     `    'status' => 'string',`,
    //     `    'amt_unit_cost' => 'number',`,
    //     `    'amt_unit_price' => 'number',`,
    //     `    'amt_subtotal' => 'float',`,
    //     `    'amt_hst' => 'float',`,
    //     `    'amt_gst' => 'float',`,
    //     `    'amt_total' => 'float',`,
    //     `    'amt_collected' => 'float',`,
    //     `    'amt_balance' => 'float',`,
    //     `    'last_qb_update' => 'string',`,
    //     `];`,
    // ].join("\n");

    right.value = [
        `protected $casts = [`,
        `    "service_date" => "string",`,
        `    "billing_number" => "string",`,
        `    "billing_type" => "string",`,
        ``,
        `    "qty" => "integer",`,
        `    "amt_item" => "float",`,
        `    "amt_item_cost" => "float",`,
        `    "amt_tax" => "float",`,
        `    `,
        `    "payment_method" => "string",`,
        `    "qbo_tax_code_ref" => "integer",`,
        `    "qbo_item_id" => "integer",`,
        `    'trans_class' => 'string',`,
        `];`,
    ].join("\n");

    parseAndCompare({
        left: document.getElementById("left-input"),
        right: document.getElementById("right-input"),
    }, toggleOutputs)
}
autoTest(toggleOutputs);