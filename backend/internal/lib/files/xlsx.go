package files

import (
	"strconv"

	"github.com/xuri/excelize/v2"
)

func NewXLSX(sheet string, header []string) (*excelize.File, string) {
	f := excelize.NewFile()
	f.DeleteSheet("Sheet1")
	f.NewSheet(sheet)

	for i, h := range header {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		_ = f.SetCellValue(sheet, cell, h)
	}
	return f, sheet
}

func XLSXSetRow(f *excelize.File, sheet string, row int, values []any) {
	for i, v := range values {
		cell, _ := excelize.CoordinatesToCellName(i+1, row)
		_ = f.SetCellValue(sheet, cell, v)
	}
}

func Itoa(i int) string { return strconv.Itoa(i) }
