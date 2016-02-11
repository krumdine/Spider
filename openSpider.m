function I=open_image(filename,endianness)
% 
% Read a projection image in spider format.
% Return -1 on error
% 
% Call as open_volume('myvolume.vol','ieee-le')
% Call as open_volume('myvolume.vol','ieee-be')
%
% Yoel Shkolnisky, November 2008

fid = fopen(filename, 'rb');

if (fid==-1)
    I=-1;
    return;
end

header=fread(fid, 256, 'float',0,endianness);
fNsam=header(12);
fLabrec=header(13);
header_size=fNsam*fLabrec;

% calculate the true header size
if header_size~=256
    fseek(fid,0,'bof');
    header=fread(fid, header_size, 'float',0,endianness);
end

ncol=header(12); %number of pixels per row
nrow=header(2);  %number of rows

I = fread(fid, nrow*ncol, 'float',0,endianness);
I=reshape(I,nrow,ncol);
fclose(fid);
function V=open_volume(filename,endianness)
%
% Read a volume in spider format.
% Return -1 on error
%
% Call as open_volume('myvolume.vol','ieee-le')
% Call as open_volume('myvolume.vol','ieee-be')
%
% Carlos Oscar S. Sorzano, July 2009

fid = fopen(filename, 'rb');

if (fid==-1)
    I=-1;
    return;
end

header=fread(fid, 256, 'float', 0, endianness);
fNsam=header(12);
fLabrec=header(13);
header_size=fNsam*fLabrec;

% calculate the true header size
if header_size~=256
    fseek(fid,0,'bof');
    header=fread(fid, header_size, 'float', 0, endianness);
end

nslice=header(1); %number of slices
ncol=header(12); %number of pixels per row
nrow=header(2);  %number of rows

V=fread(fid, nslice*nrow*ncol, 'float', 0, endianness);
V=reshape(V,nslice,nrow,ncol);
fclose(fid);
function vol=read_set_of_images(prefix,suffix)
%
%  vol=read_spider(prefix)
%  vol=read_spider(prefix,suffix)
%
% Read projections in spider format.
%
% Each projection is stored in a separate file. All filenames have the same
% prefix appended with a running number. 
% The output is a stack of projections where vol(:,:,k) is the k'th
% projection.
% The default filename suffix is 'xmp'.
%
% Example: 
%    projs=read_spider('./dataset2/g1ta');
% 
% Yoel Shkolnisky, November 2008

if nargin<2
    suffix='xmp';
end;

proj_filenames=dir(strcat(prefix,'*','.',suffix));
fpath=fileparts(prefix);
K=length(proj_filenames);

if K==0
    error('No images found');
end

for k=1:K;
    proj=open_image(fullfile(fpath,proj_filenames(k).name));
    
    if proj==-1
        error('Problem with reading file');
    end
    
    if  k==1
        vol=zeros(size(proj,1),size(proj,2),K);
    end
    vol(:,:,k)=proj;
end