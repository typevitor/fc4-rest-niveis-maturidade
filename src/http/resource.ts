export interface IResource {
  toJson(): any;
}

export type Link = {
  href: string;
  method: string;
  type?: string;
}

export class Resource implements IResource {
  constructor(
    protected data: any, 
    protected meta?: {links?:{[key: string]: Link}}
  ) {}

  toJson() {
    const {links, ...otheMeta} = this.meta || {}
    return {
      data: this.data,
      _meta: {
        ...otheMeta,
        ...(links && { _links: links })
      }
    };
  }
}

export class ResourceCollection implements IResource {
  constructor(
    protected data: any[],
    protected meta?: {
      paginationData?: { total: number; page: number; limit: number };
      links?: {[key: string] : Link};
      [key: string]: any;
    }
  ) {
  }

  toJson() {
    const { paginationData, links, ...otherData } = this.meta || {};
    const meta = {
      ...otherData,
      _links: links,
      current_page: paginationData?.page,
      total: paginationData?.total,
      per_page: paginationData?.limit,
    };

    return {
      data: this.data,
      _meta: {
        ...meta,
        ...(links && { _links: links }),
      },    
    };
  }
}