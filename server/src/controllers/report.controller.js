const prisma = require('../config/db');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const generateAttendanceExcel = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year required' });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    const records = await prisma.attendance.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { worker: true },
      orderBy: { date: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Attendance_${month}_${year}`);

    sheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Worker Code', key: 'workerCode', width: 15 },
      { header: 'Worker Name', key: 'workerName', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Overtime', key: 'overtime', width: 10 },
      { header: 'Notes', key: 'notes', width: 25 },
    ];

    records.forEach(record => {
      sheet.addRow({
        date: record.date.toISOString().split('T')[0],
        workerCode: record.worker.workerCode,
        workerName: record.worker.fullName,
        status: record.status,
        overtime: record.overtimeHours || 0,
        notes: record.notes || '',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Attendance_${month}_${year}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

const generateAttendancePDF = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Attendance_${month}_${year}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(20).text(`Attendance Report - ${month}/${year}`, { align: 'center' });
    doc.moveDown();

    // Simplify PDF generation for demonstration
    // A proper table requires a table plugin or custom drawing
    doc.fontSize(12).text('Currently, complex PDF tabular data is limited in this demo endpoint. Please use the Excel export for structured data, or implement pdfkit-table.', { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

const generateSalaryExcel = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year required' });
    }

    const records = await prisma.salaryRecord.findMany({
      where: { month: parseInt(month), year: parseInt(year) },
      include: { worker: true },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Salary_${month}_${year}`);

    sheet.columns = [
      { header: 'Worker Code', key: 'workerCode', width: 15 },
      { header: 'Worker Name', key: 'workerName', width: 25 },
      { header: 'Total Days', key: 'totalDays', width: 15 },
      { header: 'Gross Salary', key: 'grossSalary', width: 15 },
      { header: 'Advance Ded.', key: 'advanceDeduction', width: 15 },
      { header: 'Final Salary', key: 'finalSalary', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    records.forEach(record => {
      sheet.addRow({
        workerCode: record.worker.workerCode,
        workerName: record.worker.fullName,
        totalDays: record.totalDays,
        grossSalary: record.grossSalary,
        advanceDeduction: record.advanceDeduction,
        finalSalary: record.finalSalary,
        status: record.paymentStatus,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Salary_${month}_${year}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAttendanceExcel,
  generateAttendancePDF,
  generateSalaryExcel,
};
