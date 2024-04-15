import os
import re
import fitz  # PyMuPDF

def pdf_to_markdown(file_path):
    with fitz.open(file_path) as pdf_document:
        markdown_content = ''
        previous_font_size = None
        in_list = False  # Track if we are currently processing a list
        for page_number in range(pdf_document.page_count):
            page = pdf_document[page_number]
            blocks = page.get_text("dict")["blocks"]
            for b_index, block in enumerate(blocks):
                if b_index == 0:
                    leading_newlines = ''
                else:
                    leading_newlines = '\n\n'
                if 'lines' in block:  # Ensure it's a text block
                    for line in block['lines']:
                        spans = line['spans']  # Access the spans inside the line
                        if spans:
                            text = ' '.join([span['text'] for span in spans if span['text'].strip()])
                            if not text.strip():
                                continue  # Skip empty or whitespace-only lines
                            font_size = spans[0]['size']
                            is_list = re.match(r'^\d+\.\s+|^-\s+|^●\s+', text)  # Check if the line is part of a list
                            if font_size > 18:
                                markdown_content += f"{leading_newlines}# {text.strip()}\n"
                            elif font_size > 13:
                                markdown_content += f"{leading_newlines}## {text.strip()}\n"
                            elif font_size > 10:
                                markdown_content += f"{leading_newlines}### {text.strip()}\n"
                            else:
                                if previous_font_size == font_size and not is_list and not in_list:
                                    markdown_content += f" {text.strip()}"  # Continue same paragraph
                                else:
                                    if is_list:
                                        markdown_content = markdown_content.rstrip() + f"\n{text.strip()}\n"  # Start or continue a list
                                        in_list = True
                                    else:
                                        markdown_content += f"\n\n{text.strip()}"  # Start new paragraph
                                        in_list = False
                            previous_font_size = font_size
                        else:
                            markdown_content += f"{text.strip()}\n"

            # Replace bullet points and ensure correct list formatting
            markdown_content = re.sub(r'●', r'-', markdown_content)
            markdown_content = re.sub(r'(?m)^(\d+)\.\s+', r'\1. ', markdown_content)
            # Regular expressions to clean up the output
            markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content)
            markdown_content = re.sub(r'(?m)^-\s+(.*)\n', r'- \1\n', markdown_content)  # Adjust unordered lists

    return markdown_content

def write_markdown_to_file(markdown_content, output_file_path):
    os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
    with open(output_file_path, 'w', encoding='utf-8') as file:
        file.write(markdown_content)

if __name__ == '__main__':
    pdf_directory = 'pdfs'
    info_directory = 'info'
    for root, _, files in os.walk(pdf_directory):
        for file_name in files:
            if file_name.endswith('.pdf'):
                pdf_file_path = os.path.join(root, file_name)
                markdown_content = pdf_to_markdown(pdf_file_path)
                output_file_path = pdf_file_path.replace(pdf_directory, info_directory).replace('.pdf', '.md').replace(' ', '-').lower()
                write_markdown_to_file(markdown_content, output_file_path)
                print(f'Converted: {pdf_file_path} -> {output_file_path}')
