/**
 * Run technical audit and generate report
 */

import { runAuditTests, generateAuditReport } from './audit-dataset'

async function main() {
  console.log('Running technical audit...\n')
  
  const results = await runAuditTests()
  const report = generateAuditReport(results)
  
  console.log(report)
  
  // Save report to file
  const fs = require('fs')
  const path = require('path')
  const reportPath = path.join(__dirname, 'audit-report.txt')
  fs.writeFileSync(reportPath, report)
  console.log(`\nReport saved to: ${reportPath}`)
}

main().catch(console.error)
