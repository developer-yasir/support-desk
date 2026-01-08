import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

export default function FilePreviewModal({ isOpen, onClose, file }) {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && file) {
            loadFile(file);
        } else {
            // Reset state on close
            setContent(null);
            setError(null);
        }
    }, [isOpen, file]);

    const loadFile = async (fileData) => {
        setLoading(true);
        setError(null);
        setContent(null);

        const { url, filename } = fileData;
        const extension = filename.split('.').pop().toLowerCase();

        try {
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
                // Image - use URL directly
                setContent({ type: 'image', url });
                setLoading(false);
            }
            else if (['pdf'].includes(extension)) {
                // PDF - use iframe/embed
                setContent({ type: 'pdf', url });
                setLoading(false);
            }
            else if (['xlsx', 'xls', 'csv'].includes(extension)) {
                // Excel/CSV - Fetch and parse
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error("Failed to fetch file");
                    const blob = await response.blob();
                    const arrayBuffer = await blob.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                    // Get first sheet
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    // Convert to various formats depending on needs. JSON is good for rendering.
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Array of arrays

                    setContent({ type: 'sheet', data: jsonData });
                } catch (err) {
                    console.error(err);
                    setError("Failed to preview spreadsheet. It may be corrupt or password protected.");
                } finally {
                    setLoading(false);
                }
            }
            else {
                // Unsupported
                setError("Preview not available for this file type.");
                setLoading(false);
            }

        } catch (err) {
            setError("An error occurred while loading the preview.");
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-muted-foreground">Loading preview...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium mb-1">Preview Unavailable</p>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <Button variant="outline" asChild>
                        <a href={file?.url} download={file?.filename} target="_blank" rel="noopener noreferrer">
                            Download File
                        </a>
                    </Button>
                </div>
            );
        }

        if (!content) return null;

        switch (content.type) {
            case 'image':
                return (
                    <div className="flex items-center justify-center bg-black/5 rounded-lg overflow-hidden min-h-[300px]">
                        <img src={content.url} alt={file.filename} className="max-w-full max-h-[80vh] object-contain" />
                    </div>
                );
            case 'pdf':
                return (
                    <iframe
                        src={content.url}
                        className="w-full h-[70vh] rounded-lg border bg-white"
                        title="PDF Preview"
                    />
                );
            case 'sheet':
                return (
                    <div className="overflow-auto max-h-[70vh] border rounded-lg">
                        <table className="w-full text-sm border-collapse bg-white">
                            <tbody>
                                {content.data.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="border-b last:border-0 hover:bg-muted/30">
                                        {row.map((cell, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                className={`p-2 border-r last:border-0 min-w-[80px] max-w-[300px] truncate ${rowIndex === 0 ? 'bg-muted/50 font-medium' : ''}`}
                                            >
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {content.data.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">Empty sheet</div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl w-full max-h-[95vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="flex items-center gap-2 truncate">
                            <FileText className="h-5 w-5" />
                            <span className="truncate">{file?.filename}</span>
                        </DialogTitle>
                        {file && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={file.url} download={file.filename} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </a>
                            </Button>
                        )}
                    </div>
                    <DialogDescription>
                        File Preview
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-1 mt-2">
                    {renderContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
