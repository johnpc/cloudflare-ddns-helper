import Cloudflare from 'cloudflare';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

type DnsUpdateProps = {
  domainName: string;
  recordName: string;
  recordValue: string;
  apiEmail: string;
  apiKey: string
}
const updateDnsRecord = async (dnsUpdateProps: DnsUpdateProps) => {
  const { domainName, recordName, recordValue, apiEmail, apiKey } = dnsUpdateProps;
  const client = new Cloudflare({
    apiEmail,
    apiKey,
  });

  // First, get the zone ID for the domain
  const zones = await client.zones.list();
  const zone = zones.result.find(z => z.name === domainName);

  if (!zone) {
    throw new Error(`Zone not found for domain: ${domainName}`);
  }

  // Then, get the DNS record that matches the record name
  const dnsRecords = await client.dns.records.list({ zone_id: zone.id });
  const record = dnsRecords.result.find(r => r.name === `${recordName}.${domainName}`);

  if (!record) {
    // If record doesn't exist, create it
    const newRecord = await client.dns.records.create({
      zone_id: zone.id,
      type: 'A',
      name: recordName,
      content: recordValue,
      ttl: 1,
      proxied: false,
    });
    console.log('Created new DNS record:', newRecord);
  } else {
    if (record.content === recordValue) {
      console.log('DNS record already up to date:', record);
      return;
    }
    // If record exists, update it
    const updatedRecord = await client.dns.records.edit(record.id, {
      zone_id: zone.id,
      type: record.type,
      name: recordName,
      content: recordValue,
      ttl: record.ttl,
      proxied: record.proxied
    });
    console.log('Updated DNS record:', updatedRecord);
  }
}

const getPublicIp = async () => {
  const response = await fetch('https://checkip.amazonaws.com');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const ip = await response.text();
  return ip.trim();
}

const main = async () => {
  const domainName = process.env['DOMAIN_NAME']
  const recordNames = process.env['RECORD_NAMES']?.split(',') ?? []
  const apiEmail = process.env['CLOUDFLARE_EMAIL'];
  const apiKey = process.env['CLOUDFLARE_API_KEY'];
  if (!domainName || !recordNames || !apiEmail || !apiKey) {
    throw new Error('Missing required environment variables. DOMAIN_NAME RECORD_NAMES CLOUDFLARE_API_EMAIL CLOUDFLARE_API_KEY');
  }
  const updateRecordPromises = recordNames.map(async (recordName) => {
    await updateDnsRecord({
      domainName,
      recordName,
      recordValue: await getPublicIp(),
      apiEmail,
      apiKey,
    });
  })
  await Promise.all(updateRecordPromises);
}

main();